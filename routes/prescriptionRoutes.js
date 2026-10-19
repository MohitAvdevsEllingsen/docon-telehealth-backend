const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// GET all prescriptions (supports grouped=true, year, patient, search)
router.get('/', async (req, res) => {
  try {
    const { grouped, year, patientId, doctorId, search } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (year) {
      query.year = Number(year);
    }
    if (patientId) {
      query.patient = patientId;
    }
    if (doctorId) {
      query.doctor = doctorId;
    }

    let prescriptions = await Prescription.find(query)
      .populate('doctor', 'name specialization clinicName consultationFee upiId avatarUrl')
      .populate('patient', 'name age gender parentName phone')
      .sort({ date: -1 });

    if (search) {
      const s = search.toLowerCase();
      prescriptions = prescriptions.filter(
        (p) =>
          p.diagnosis.toLowerCase().includes(s) ||
          p.doctor?.name.toLowerCase().includes(s) ||
          p.patient?.name.toLowerCase().includes(s)
      );
    }

    if (grouped === 'true') {
      // Group by year into format suitable for SectionList
      const groupedMap = {};
      prescriptions.forEach((item) => {
        const y = item.year || new Date(item.date).getFullYear();
        if (!groupedMap[y]) groupedMap[y] = [];
        groupedMap[y].push(item);
      });

      const sections = Object.keys(groupedMap)
        .sort((a, b) => Number(b) - Number(a))
        .map((y) => ({
          title: y,
          data: groupedMap[y],
        }));

      return res.json({ success: true, count: prescriptions.length, sections });
    }

    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor')
      .populate('patient');

    if (!prescription || prescription.isDeleted) {
      return res.status(404).json({ success: false, message: 'Prescription not found or has been deleted.' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET public prescription by short code (matching SMS link: https://gs.im/PHRMSY/e/:code)
router.get('/view/:code', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      shortCode: req.params.code,
      isDeleted: { $ne: true },
    })
      .populate('doctor')
      .populate('patient');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'This prescription link is invalid or has expired / deleted by the patient.',
      });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE prescription by token (matching SMS delete link)
router.all('/delete-by-token/:deleteToken', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ deleteToken: req.params.deleteToken });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Invalid deletion token or already removed.' });
    }

    prescription.isDeleted = true;
    await prescription.save();

    res.json({
      success: true,
      message: 'Prescription successfully deleted from records as per patient request.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create prescription (with automatic SMS notification generation!)
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, diagnosis, symptoms, vitals, medicines, generalAdvice, date } = req.body;

    let doctor = doctorId ? await Doctor.findById(doctorId).catch(() => null) : null;
    if (!doctor) doctor = await Doctor.findOne();

    let patient = patientId ? await Patient.findById(patientId).catch(() => null) : null;
    if (!patient) patient = await Patient.findOne();

    if (!doctor || !patient) {
      return res.status(400).json({ success: false, message: 'Doctor and Patient are required.' });
    }

    const rxDate = date ? new Date(date) : new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayFormatted = String(rxDate.getDate()).padStart(2, '0');
    const monthFormatted = months[rxDate.getMonth()];
    const year = rxDate.getFullYear();

    const shortCode = crypto.randomBytes(6).toString('base64url');
    const deleteToken = crypto.randomBytes(6).toString('base64url');

    const prescription = await Prescription.create({
      doctor: doctor._id,
      patient: patient._id,
      date: rxDate,
      dayFormatted,
      monthFormatted,
      year,
      diagnosis: diagnosis || 'General Pediatric Consultation',
      symptoms: symptoms || ['Checkup'],
      vitals: vitals || { weight: '16 kg', temperature: '98.6 F', pulse: '96 bpm', spo2: '99%' },
      medicines: medicines || [],
      generalAdvice: generalAdvice || 'Review as advised by doctor.',
      shortCode,
      deleteToken,
    });

    // Auto-create SMS notification in history matching PharmEasy Docon format
    const viewUrl = `https://gs.im/PHRMSY/e/${shortCode}`;
    const deleteUrl = `https://gs.im/PHRMSY/e/${deleteToken}`;
    const smsText = `Thanks for visiting ${doctor.name}. View your prescription on PharmEasy: ${viewUrl}. To delete it, click: ${deleteUrl}. - Docon by PharmEasy`;

    await Notification.create({
      recipientPhone: patient.phone,
      senderTitle: 'Docon by PharmEasy',
      messageText: smsText,
      viewLink: viewUrl,
      deleteLink: deleteUrl,
      doctorName: doctor.name,
      prescription: prescription._id,
      formattedTime: `Today at ${rxDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    });

    const populated = await Prescription.findById(prescription._id).populate('doctor').populate('patient');

    res.status(201).json({
      success: true,
      message: 'Prescription created and SMS notification dispatched.',
      data: populated,
      smsDispatched: {
        to: patient.phone,
        text: smsText,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
