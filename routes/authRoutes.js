const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const JWT_SECRET = process.env.JWT_SECRET || 'docon_super_secret_jwt_key_2026';

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      role = 'patient',
      childName,
      childAge,
      childGender,
      specialization,
      clinicName,
      qualification,
    } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, phone number, email, and password.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or mobile number already exists.',
      });
    }

    let linkedPatient = null;
    let linkedDoctor = null;

    if (role === 'doctor') {
      // Create Doctor entity for doctor user
      linkedDoctor = await Doctor.create({
        name: fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`,
        specialization: specialization || 'Pediatrician',
        qualification: qualification || 'MBBS, MD',
        clinicName: clinicName || `${fullName.trim()} Wellness Clinic`,
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        consultationFee: 800,
        upiId: `${phone.trim()}@ybl`,
      });
    } else {
      // Patient role: Create or link child patient profile
      if (childName && childName.trim()) {
        linkedPatient = await Patient.create({
          name: childName.trim(),
          age: Number(childAge) || 4,
          gender: childGender || 'Male',
          parentName: fullName,
          phone: phone.trim(),
          email: email.toLowerCase().trim(),
        });
      } else {
        linkedPatient = await Patient.findOne({ phone: phone.trim() });
      }
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      specialization: specialization || '',
      clinicName: clinicName || '',
      linkedPatient: linkedPatient ? linkedPatient._id : undefined,
      linkedDoctor: linkedDoctor ? linkedDoctor._id : undefined,
    });

    const token = generateToken(newUser._id);
    const populatedUser = await User.findById(newUser._id)
      .populate('linkedPatient')
      .populate('linkedDoctor')
      .select('-password');

    res.status(201).json({
      success: true,
      message: `Account registered successfully as ${role}.`,
      token,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your mobile number/email and password.',
      });
    }

    const cleanIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier },
      ],
    })
      .populate('linkedPatient')
      .populate('linkedDoctor');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: `Logged in successfully as ${user.role}.`,
      token,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me (Get Current Profile)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('linkedPatient')
      .populate('linkedDoctor');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

module.exports = router;
