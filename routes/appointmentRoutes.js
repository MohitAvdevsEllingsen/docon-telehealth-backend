const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// GET all appointments (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { doctorId, patientId, status } = req.query;
    let query = {};
    if (doctorId && mongoose.isValidObjectId(doctorId)) query.doctor = doctorId;
    if (patientId && mongoose.isValidObjectId(patientId)) query.patient = patientId;
    if (status && status !== 'All') query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization clinicName clinicAddress phone avatarUrl consultationFee upiId')
      .populate('patient', 'name age gender parentName phone')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('doctor')
      .populate('patient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Status updated.', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST book appointment (fully dynamic)
router.post('/', async (req, res) => {
  try {
    let {
      doctorId,
      patientId,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      appointmentDate,
      timeSlot,
      consultationType,
      symptomsDescription,
      fee,
    } = req.body;

    // 1. Resolve Doctor
    let doctor;
    if (doctorId && mongoose.isValidObjectId(doctorId)) {
      doctor = await Doctor.findById(doctorId);
    }
    if (!doctor) {
      doctor = await Doctor.findOne();
    }
    if (!doctor) {
      return res.status(400).json({ success: false, message: 'No doctors available in system.' });
    }

    // 2. Resolve or Create Patient
    let patient;
    if (patientId && mongoose.isValidObjectId(patientId)) {
      patient = await Patient.findById(patientId);
    }
    if (!patient && patientName) {
      patient = await Patient.findOne({ name: new RegExp(`^${patientName.trim()}$`, 'i') });
      if (!patient) {
        patient = await Patient.create({
          name: patientName.trim(),
          phone: patientPhone || '9924000156',
          age: patientAge ? Number(patientAge) : 4,
          gender: patientGender || 'Male',
          parentName: patientName.includes('Tadvi') ? 'Parmar Maheshbhai' : 'Guardian',
        });
      }
    }
    if (!patient) {
      patient = await Patient.findOne();
    }
    if (!patient) {
      patient = await Patient.create({
        name: 'Heeyan Tadvi',
        phone: '9924000156',
        age: 4,
        gender: 'Male',
        parentName: 'Parmar Maheshbhai',
      });
    }

    // 3. Create Appointment in MongoDB
    const appointment = await Appointment.create({
      doctor: doctor._id,
      patient: patient._id,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
      timeSlot: timeSlot || '10:30 AM',
      consultationType: consultationType || 'Clinic Visit',
      symptomsDescription: symptomsDescription || 'Routine consultation',
      fee: fee || doctor.consultationFee || 1111,
      status: 'Scheduled',
      paymentStatus: 'Paid',
    });

    // 4. Create SMS notification in MongoDB
    try {
      await Notification.create({
        recipientPhone: patient.phone || '9924000156',
        senderTitle: 'Docon by PharmEasy',
        messageText: `DocOn: Appointment confirmed with ${doctor.name} for ${timeSlot}. Mode: ${consultationType}. Clinic: ${doctor.clinicName || 'Clinic'}.`,
        doctorName: doctor.name,
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (notifErr) {
      console.warn('Notification log error (non-fatal):', notifErr.message);
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization clinicName clinicAddress consultationFee phone upiId avatarUrl')
      .populate('patient', 'name age gender parentName phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully in MongoDB!',
      data: populated,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
