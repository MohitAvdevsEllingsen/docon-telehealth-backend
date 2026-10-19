const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

const seedInitialData = async () => {
  try {
    const existingDoctorCount = await Doctor.countDocuments();
    if (existingDoctorCount > 0) {
      console.log('[Seed] Data already seeded. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding initial medical, transaction, user and prescription records...');

    // 1. Create Doctors
    const drJigar = await Doctor.create({
      name: 'Dr. Jigar Shah',
      specialization: 'Pediatrician',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experienceYears: 14,
      clinicName: 'Dr. Jigar Child Wellness Clinic',
      clinicAddress: '402, Shivalik Plaza, Near IIM Cross Roads, Ahmedabad',
      phone: '+91 97258 85350',
      email: 'dr.jigar.shah@docon.co.in',
      consultationFee: 1111,
      upiId: '9725885350@ybl',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
      rating: 4.9,
      reviewsCount: 342,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timings: '09:30 AM - 01:00 PM, 05:00 PM - 09:00 PM',
    });

    const drNeha = await Doctor.create({
      name: 'Dr. Neha Patel',
      specialization: 'Gynecologist',
      qualification: 'MBBS, MS (OBGYN)',
      experienceYears: 10,
      clinicName: 'Grace Women Clinic',
      clinicAddress: '101, Titanium City Center, Satellite, Ahmedabad',
      phone: '+91 98251 12345',
      email: 'dr.neha.patel@docon.co.in',
      consultationFee: 1000,
      upiId: 'drneha@okhdfcbank',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813583-1498144bfa28?w=300&h=300&fit=crop&crop=face',
      rating: 4.8,
      reviewsCount: 195,
      availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
      timings: '10:00 AM - 02:00 PM, 06:00 PM - 08:30 PM',
    });

    // 2. Create Patients
    const patientHeeyan = await Patient.create({
      name: 'Heeyan Tadvi',
      age: 4,
      gender: 'Male',
      parentName: 'Parmar Maheshbhai',
      phone: '9924000156',
      email: 'parmar.mahesh@gmail.com',
      bloodGroup: 'B+',
      address: 'Vastrapur, Ahmedabad, Gujarat',
    });

    // 2.1 Create Default Parent User
    await User.create({
      fullName: 'Parmar Maheshbhai',
      phone: '9924000156',
      email: 'parmar.mahesh@gmail.com',
      password: 'password123',
      role: 'patient',
      linkedPatient: patientHeeyan._id,
    });

    // 2.2 Create Default Doctor User
    await User.create({
      fullName: 'Dr. Jigar Shah',
      phone: '9725885350',
      email: 'dr.jigar.shah@docon.co.in',
      password: 'doctor123',
      role: 'doctor',
      specialization: 'Pediatrician',
      clinicName: 'Dr. Jigar Child Wellness Clinic',
      linkedDoctor: drJigar._id,
    });

    // 3. Create Seed Prescriptions (Matching screenshot timeline)
    const rawPrescriptions = [
      // 2026 records
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2026-09-25T10:30:00Z'),
        dayFormatted: '25',
        monthFormatted: 'Sep',
        year: 2026,
        diagnosis: 'Acute Rhinitis & Mild Spasmodic Cough',
        vitals: { weight: '16.8 kg', temperature: '98.6 F', pulse: '96 bpm', spo2: '99%' },
        medicines: [
          { name: 'Syrup Ascoril-LS Junior', dosage: '2.5 ml', frequency: '1-0-1 (Morning & Night)', duration: '5 Days', timing: 'After Food', instructions: 'For productive cough' },
          { name: 'Syrup Montair-LC Kid', dosage: '5 ml', frequency: '0-0-1 (Night only)', duration: '7 Days', timing: 'At Bedtime', instructions: 'Antiallergic' },
          { name: 'Nasoclear Saline Drops', dosage: '2 drops', frequency: '1-1-1 (Thrice daily)', duration: '3 Days', timing: 'Both nostrils', instructions: 'Before feeding/sleeping' },
        ],
        generalAdvice: 'Steam inhalation twice daily. Avoid citrus foods and chilled drinks.',
        shortCode: 'Sep25_2026',
        deleteToken: 'del_Sep25_2026',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2026-09-08T11:15:00Z'),
        dayFormatted: '08',
        monthFormatted: 'Sep',
        year: 2026,
        diagnosis: 'Low Grade Viral Pyrexia with Throat Congestion',
        vitals: { weight: '16.5 kg', temperature: '100.4 F', pulse: '104 bpm', spo2: '98%' },
        medicines: [
          { name: 'Syrup Calpol 250mg/5ml', dosage: '5 ml', frequency: 'SOS (Every 6 hrs if fever > 100°F)', duration: '3 Days', timing: 'After Food', instructions: 'Paracetamol suspension' },
          { name: 'Syrup Meftal-P (Mefenamic Acid)', dosage: '3.5 ml', frequency: 'SOS (High spike fever)', duration: '2 Days', timing: 'After Food', instructions: 'Maintain 6h gap from Calpol' },
          { name: 'Zincovit Junior Syrup', dosage: '2.5 ml', frequency: '1-0-0 (Morning)', duration: '15 Days', timing: 'After Breakfast', instructions: 'Immune booster' },
        ],
        generalAdvice: 'Tepid sponging if temperature reaches above 101 F. Ensure hydration with ORS and soups.',
        shortCode: 'Sep08_2026',
        deleteToken: 'del_Sep08_2026',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2026-02-25T17:00:00Z'),
        dayFormatted: '25',
        monthFormatted: 'Feb',
        year: 2026,
        diagnosis: 'Gastroenteritis & Mild Dehydration',
        vitals: { weight: '15.9 kg', temperature: '98.8 F', pulse: '100 bpm', spo2: '99%' },
        medicines: [
          { name: 'Econorm Sachet 250mg', dosage: '1 Sachet', frequency: '1-0-1 (Twice daily)', duration: '4 Days', timing: 'Mixed in lukewarm water/curd', instructions: 'Probiotic' },
          { name: 'Syrup Ondem 2mg/5ml', dosage: '3 ml', frequency: 'SOS before feed', duration: '2 Days', timing: '30 mins before food', instructions: 'Anti-emetic' },
          { name: 'Electral ORS Packets', dosage: 'As needed', frequency: 'Frequent sips', duration: '3 Days', timing: 'Throughout the day', instructions: 'Dissolve in clean water' },
        ],
        generalAdvice: 'Encourage curd, khichdi, banana, and coconut water. No spicy or oily snacks.',
        shortCode: 'Feb25_2026',
        deleteToken: 'del_Feb25_2026',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2026-01-27T12:00:00Z'),
        dayFormatted: '27',
        monthFormatted: 'Jan',
        year: 2026,
        diagnosis: 'Acute Otitis Media (Right Ear) & Cold',
        vitals: { weight: '15.7 kg', temperature: '99.8 F', pulse: '98 bpm', spo2: '99%' },
        medicines: [
          { name: 'Augmentin Duo Dry Syrup (Amox-Clav)', dosage: '4 ml', frequency: '1-0-1 (Every 12 hrs)', duration: '5 Days', timing: 'Strictly after food', instructions: 'Antibiotic course complete strictly' },
          { name: 'Otogesic Ear Drops', dosage: '2 drops', frequency: '1-1-1 (Thrice daily)', duration: '4 Days', timing: 'In Right Ear', instructions: 'Pain relief ear drop' },
        ],
        generalAdvice: 'Do not let water enter the right ear during bath. Review after 5 days.',
        shortCode: 'ik1DGhRV0hw',
        deleteToken: 'ik1AQeqa6sR',
      },

      // 2025 records
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2025-11-28T18:30:00Z'),
        dayFormatted: '28',
        monthFormatted: 'Nov',
        year: 2025,
        diagnosis: 'Seasonal Wheezing & Bronchial Irritation',
        vitals: { weight: '15.2 kg', temperature: '98.4 F', pulse: '92 bpm', spo2: '98%' },
        medicines: [
          { name: 'Duolin Respules (Nebulization)', dosage: '1 Respule', frequency: '1-0-1 (Twice daily)', duration: '3 Days', timing: 'Via Nebulizer machine', instructions: 'Salbutamol + Ipratropium' },
          { name: 'Budecort 0.5mg Respule', dosage: '1/2 Respule', frequency: '0-0-1 (Night)', duration: '3 Days', timing: 'Via Nebulizer', instructions: 'Wash mouth after nebulization' },
        ],
        generalAdvice: 'Avoid dust, pollen, mosquito coils, and sudden temperature shifts.',
        shortCode: 'Nov28_2025',
        deleteToken: 'del_Nov28_2025',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2025-09-16T19:40:00Z'),
        dayFormatted: '16',
        monthFormatted: 'Sep',
        year: 2025,
        diagnosis: 'Streptococcal Pharyngitis',
        vitals: { weight: '14.9 kg', temperature: '101.2 F', pulse: '106 bpm', spo2: '98%' },
        medicines: [
          { name: 'Syrup Azithral 100mg/5ml', dosage: '5 ml', frequency: '1-0-0 (Once daily)', duration: '3 Days', timing: '1 hour before food', instructions: 'Finish 3 days course' },
          { name: 'Syrup Crocin 240mg', dosage: '5 ml', frequency: 'SOS (For fever/pain)', duration: '3 Days', timing: 'After food', instructions: 'Max 4 times in 24 hours' },
        ],
        generalAdvice: 'Warm salt water gargles if possible. Soft diet only.',
        shortCode: 'F2uZPkmUzAp',
        deleteToken: 'F2uWZgU9FLK',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2025-09-12T16:15:00Z'),
        dayFormatted: '12',
        monthFormatted: 'Sep',
        year: 2025,
        diagnosis: 'Follow-up Consultation for Dry Cough',
        vitals: { weight: '14.8 kg', temperature: '98.6 F', pulse: '94 bpm', spo2: '99%' },
        medicines: [
          { name: 'Syrup Alex Junior', dosage: '2.5 ml', frequency: '1-1-1 (Thrice daily)', duration: '4 Days', timing: 'After meals', instructions: 'For soothing dry throat' },
        ],
        generalAdvice: 'Honey and ginger drops can be given at bedtime.',
        shortCode: 'Sep12_2025',
        deleteToken: 'del_Sep12_2025',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2025-08-12T12:30:00Z'),
        dayFormatted: '12',
        monthFormatted: 'Aug',
        year: 2025,
        diagnosis: 'Routine Pediatric Growth & Vaccination Checkup (MMR Booster)',
        vitals: { weight: '14.6 kg', temperature: '98.4 F', pulse: '96 bpm', spo2: '99%' },
        medicines: [
          { name: 'Syrup Calpol 250mg', dosage: '5 ml', frequency: 'SOS in case of post-vaccine fever', duration: '2 Days', timing: 'After Food', instructions: 'Give only if temperature rises' },
          { name: 'Ostocalcium B12 Suspension', dosage: '5 ml', frequency: '1-0-0 (Morning)', duration: '30 Days', timing: 'After Milk/Breakfast', instructions: 'Bone strength' },
        ],
        generalAdvice: 'Apply cold compress if swelling at injection site occurs. Milestone development is normal.',
        shortCode: 'Ln3x7QibryP',
        deleteToken: 'Ln3vhMQqxKa',
      },
      {
        doctor: drJigar._id,
        patient: patientHeeyan._id,
        date: new Date('2025-07-11T11:00:00Z'),
        dayFormatted: '11',
        monthFormatted: 'Jul',
        year: 2025,
        diagnosis: 'Heat Rash (Miliaria Rubra) & Pruritus',
        vitals: { weight: '14.4 kg', temperature: '98.2 F', pulse: '94 bpm', spo2: '99%' },
        medicines: [
          { name: 'Calamine Lotion 100ml', dosage: 'Apply thin layer', frequency: '1-0-1 (Twice daily)', duration: '5 Days', timing: 'On affected back/neck', instructions: 'External use only' },
          { name: 'Syrup Atarax (Hydroxyzine)', dosage: '2.5 ml', frequency: '0-0-1 (Night)', duration: '3 Days', timing: 'Bedtime', instructions: 'For itching relief' },
        ],
        generalAdvice: 'Keep child in airy, cool room. Dress in loose cotton clothing.',
        shortCode: 'Jul11_2025',
        deleteToken: 'del_Jul11_2025',
      },
    ];

    const insertedPrescriptions = await Prescription.insertMany(rawPrescriptions);

    // 4. Create the Featured UPI Transaction (matching Screenshot 1!)
    await Transaction.create({
      amount: 1111.00,
      currency: '₹',
      status: 'successful',
      receiverName: 'KRUNAL S KANOJIYA',
      receiverUpiId: '9725885350@ybl',
      receiverMaskedUpi: '9725XXXXXX@ybl',
      senderName: 'PARMAR MAHESHBHAI',
      senderBank: 'STATE BANK OF INDIA 0156',
      senderUpiId: '9924XXXXXX@sbi',
      upiTransactionId: '100785122436',
      transactionDateTime: '04/10/2026 at 10:05 PM',
      paymentType: 'Yono SBI Pay',
      relatedPrescription: insertedPrescriptions[0]._id,
    });

    // 5. Create SMS Notifications matching Screenshot 5!
    await Notification.create([
      {
        recipientPhone: '9924000156',
        senderTitle: 'Docon by PharmEasy',
        messageText: 'Thanks for visiting Dr. Jigar Shah. View your prescription on PharmEasy: https://gs.im/PHRMSY/e/Ln3x7QibryP. To delete it, click: https://gs.im/PHRMSY/e/Ln3vhMQqxKa. - Docon by PharmEasy',
        viewLink: 'https://gs.im/PHRMSY/e/Ln3x7QibryP',
        deleteLink: 'https://gs.im/PHRMSY/e/Ln3vhMQqxKa',
        doctorName: 'Dr. Jigar Shah',
        formattedTime: 'Tuesday, 12 August 2025 at 12:48 pm',
        sentAt: new Date('2025-08-12T12:48:00Z'),
        prescription: insertedPrescriptions[7]._id,
      },
      {
        recipientPhone: '9924000156',
        senderTitle: 'Docon by PharmEasy',
        messageText: 'Thanks for visiting Dr. Jigar Shah. View your prescription on PharmEasy: https://gs.im/PHRMSY/e/F2uZPkmUzAp. To delete it, click: https://gs.im/PHRMSY/e/F2uWZgU9FLK. - Docon by PharmEasy',
        viewLink: 'https://gs.im/PHRMSY/e/F2uZPkmUzAp',
        deleteLink: 'https://gs.im/PHRMSY/e/F2uWZgU9FLK',
        doctorName: 'Dr. Jigar Shah',
        formattedTime: 'Tuesday, 16 September 2025 at 7:56 pm',
        sentAt: new Date('2025-09-16T19:56:00Z'),
        prescription: insertedPrescriptions[5]._id,
      },
      {
        recipientPhone: '9924000156',
        senderTitle: 'Docon by PharmEasy',
        messageText: 'Thanks for visiting Dr. Jigar Shah. View your prescription on PharmEasy: https://gs.im/PHRMSY/e/ik1DGhRV0hw. To delete it, click: https://gs.im/PHRMSY/e/ik1AQeqa6sR. - Docon by PharmEasy',
        viewLink: 'https://gs.im/PHRMSY/e/ik1DGhRV0hw',
        deleteLink: 'https://gs.im/PHRMSY/e/ik1AQeqa6sR',
        doctorName: 'Dr. Jigar Shah',
        formattedTime: 'Tuesday, 27 January 2026 at 12:13 pm',
        sentAt: new Date('2026-01-27T12:13:00Z'),
        prescription: insertedPrescriptions[3]._id,
      },
    ]);

    // 6. Create active Appointment
    await Appointment.create({
      doctor: drJigar._id,
      patient: patientHeeyan._id,
      appointmentDate: new Date('2026-10-16T10:30:00Z'),
      timeSlot: '10:30 AM',
      status: 'Scheduled',
      consultationType: 'Clinic Visit',
      symptomsDescription: 'Pediatric follow-up checkup & wellness review',
      fee: 1111,
      paymentStatus: 'Paid',
    });

    console.log('[Seed] Database successfully populated with real records matching all screenshots!');
  } catch (error) {
    console.error('[Seed] Error seeding initial data:', error);
  }
};

module.exports = { seedInitialData };
