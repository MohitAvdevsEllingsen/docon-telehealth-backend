const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET all SMS notifications history
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ sentAt: -1 });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST simulate sending custom SMS
router.post('/simulate', async (req, res) => {
  try {
    const { recipientPhone, messageText, doctorName, viewLink, deleteLink } = req.body;
    const notification = await Notification.create({
      recipientPhone: recipientPhone || '9924000156',
      messageText: messageText || 'Consultation completed.',
      doctorName: doctorName || 'Dr. Jigar Shah',
      viewLink: viewLink || 'https://gs.im/PHRMSY/e/sample',
      deleteLink: deleteLink || 'https://gs.im/PHRMSY/e/del_sample',
      formattedTime: 'Just now',
    });
    res.status(201).json({ success: true, message: 'SMS simulated successfully', data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
