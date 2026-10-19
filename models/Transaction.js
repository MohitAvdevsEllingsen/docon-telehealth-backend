const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true }, // e.g. 1111.00
    currency: { type: String, default: '₹' },
    status: { type: String, enum: ['successful', 'pending', 'failed'], default: 'successful' },
    receiverName: { type: String, required: true }, // "KRUNAL S KANOJIYA"
    receiverUpiId: { type: String, required: true }, // "9725885350@ybl"
    receiverMaskedUpi: { type: String, default: '9725XXXXXX@ybl' },
    senderName: { type: String, required: true }, // "PARMAR MAHESHBHAI"
    senderBank: { type: String, default: 'STATE BANK OF INDIA 0156' },
    senderUpiId: { type: String, default: '9924XXXXXX@sbi' },
    upiTransactionId: { type: String, required: true, unique: true }, // "100785122436"
    transactionDateTime: { type: String, default: '04/10/2026 at 10:05 PM' },
    paymentType: { type: String, default: 'Yono SBI Pay' },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    relatedPrescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
