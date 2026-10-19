const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientPhone: { type: String, required: true },
    senderTitle: { type: String, default: 'Docon by PharmEasy' },
    messageText: { type: String, required: true },
    viewLink: { type: String, default: '' },
    deleteLink: { type: String, default: '' },
    doctorName: { type: String, default: 'Dr. Jigar Shah' },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    sentAt: { type: Date, default: Date.now },
    formattedTime: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
