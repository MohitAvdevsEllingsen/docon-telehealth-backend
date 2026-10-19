const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "11:30 AM"
    status: { type: String, enum: ['Scheduled', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'], default: 'Scheduled' },
    consultationType: { type: String, enum: ['Clinic Visit', 'Video Consultation'], default: 'Clinic Visit' },
    symptomsDescription: { type: String, default: '' },
    fee: { type: Number, default: 800 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
