const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Heeyan Tadvi"
    age: { type: Number, default: 4 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    parentName: { type: String, default: 'Parmar Maheshbhai' },
    phone: { type: String, default: '9924000156' },
    email: { type: String, default: 'heeyan.tadvi@example.com' },
    bloodGroup: { type: String, default: 'B+' },
    address: { type: String, default: 'Ahmedabad, Gujarat' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
