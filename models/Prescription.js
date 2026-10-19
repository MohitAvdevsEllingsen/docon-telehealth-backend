const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Syrup Calpol 250mg", "Amoxiclav Dry Syrup"
  dosage: { type: String, default: '5 ml' },
  frequency: { type: String, default: '1-0-1 (Twice a day)' }, // Morning - Afternoon - Night
  duration: { type: String, default: '5 Days' },
  timing: { type: String, default: 'After Food' },
  instructions: { type: String, default: 'Shake well before use' },
});

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    dayFormatted: { type: String, required: true }, // e.g. "25"
    monthFormatted: { type: String, required: true }, // e.g. "Sep"
    year: { type: Number, required: true }, // e.g. 2026, 2025
    diagnosis: { type: String, default: 'Viral Fever with mild URTI' },
    symptoms: { type: [String], default: ['Fever', 'Cough', 'Cold'] },
    vitals: {
      weight: { type: String, default: '16.5 kg' },
      temperature: { type: String, default: '99.2 F' },
      pulse: { type: String, default: '98 bpm' },
      spo2: { type: String, default: '98%' },
    },
    medicines: [medicineItemSchema],
    generalAdvice: { type: String, default: 'Plenty of warm fluids, rest, avoid cold drinks. Review if fever persists after 3 days.' },
    status: { type: String, default: 'Active' },
    type: { type: String, default: 'Prescription' },
    shortCode: { type: String, unique: true }, // For https://gs.im/PHRMSY/e/:shortCode
    deleteToken: { type: String, unique: true }, // For deletion link
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
