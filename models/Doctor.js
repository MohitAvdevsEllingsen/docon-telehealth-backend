const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Dr. Jigar Shah"
    specialization: { type: String, required: true }, // e.g., "Pediatrician"
    qualification: { type: String, default: 'MBBS, MD (Pediatrics)' },
    experienceYears: { type: Number, default: 12 },
    clinicName: { type: String, default: 'Child Care Clinic' },
    clinicAddress: { type: String, default: 'Shop 4, Ground Floor, Sunrise Heights, Ahmedabad' },
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'dr.jigarshah@example.com' },
    consultationFee: { type: Number, default: 800 },
    upiId: { type: String, default: 'drjigar@okaxis' },
    avatarUrl: { type: String, default: '' },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 128 },
    availableDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    timings: { type: String, default: '10:00 AM - 01:00 PM, 05:00 PM - 08:30 PM' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
