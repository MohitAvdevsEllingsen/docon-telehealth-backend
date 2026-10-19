const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedInitialData } = require('./seed/seedData');

const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Root landing page with interactive status dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DocOn & Telehealth API Backend</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 600px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .badge { background: #10b981; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .badge::before { content: ""; width: 8px; height: 8px; background: #fff; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        h1 { font-size: 24px; font-weight: 700; color: #ffffff; }
        p.sub { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
        .info-box { background: #0f172a; padding: 14px; border-radius: 10px; border: 1px solid #334155; }
        .info-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
        .info-val { font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; }
        .section-title { font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .links-list { display: flex; flex-direction: column; gap: 8px; }
        .api-link { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; padding: 12px 16px; border-radius: 8px; text-decoration: none; color: #38bdf8; font-size: 14px; font-family: monospace; transition: all 0.2s; }
        .api-link:hover { background: #334155; color: #7dd3fc; border-color: #38bdf8; }
        .method { background: #0284c7; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 8px; }
        .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <span class="badge">Live & Operational</span>
            <h1 style="margin-top: 8px;">DocOn & Telehealth Backend</h1>
            <p class="sub">Powered by PharmEasy DocOn &bull; Node.js Express & MongoDB Atlas</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Environment</div>
            <div class="info-val">Production (Render Cloud)</div>
          </div>
          <div class="info-box">
            <div class="info-label">Database</div>
            <div class="info-val">MongoDB Atlas (Cluster 0)</div>
          </div>
        </div>

        <div class="section-title">Available API Endpoints</div>
        <div class="links-list">
          <a class="api-link" href="/api/health" target="_blank"><span><span class="method">GET</span>/api/health</span><span>&rarr;</span></a>
          <a class="api-link" href="/api/doctors" target="_blank"><span><span class="method">GET</span>/api/doctors</span><span>&rarr;</span></a>
          <a class="api-link" href="/api/prescriptions?grouped=true" target="_blank"><span><span class="method">GET</span>/api/prescriptions?grouped=true</span><span>&rarr;</span></a>
          <a class="api-link" href="/api/payments/latest" target="_blank"><span><span class="method">GET</span>/api/payments/latest</span><span>&rarr;</span></a>
          <a class="api-link" href="/api/notifications" target="_blank"><span><span class="method">GET</span>/api/notifications</span><span>&rarr;</span></a>
          <a class="api-link" href="/view/Sep25_2026" target="_blank"><span><span class="method">GET</span>/view/Sep25_2026 (Web Rx)</span><span>&rarr;</span></a>
        </div>

        <div class="footer">
          DocOn Telehealth API Service &bull; All systems operational
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'DocOn & Telehealth API Backend',
    database: 'MongoDB (Mongoose)',
  });
});

// Web view simulation for SMS links: e.g. /view/:code
app.get('/view/:code', async (req, res) => {
  try {
    const Prescription = require('./models/Prescription');
    const rx = await Prescription.findOne({ shortCode: req.params.code, isDeleted: { $ne: true } })
      .populate('doctor')
      .populate('patient');

    if (!rx) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Prescription Not Found | PharmEasy Docon</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
          <h2 style="color: #e11d48;">Prescription Not Available</h2>
          <p style="color: #64748b;">This prescription link has expired or was removed by the patient.</p>
        </body>
        </html>
      `);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Prescription - ${rx.patient.name} | DocOn by PharmEasy</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; }
          .header { background: #0284c7; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
          .clinic-info h2 { margin: 0 0 4px 0; font-size: 20px; }
          .clinic-info p { margin: 0; opacity: 0.9; font-size: 13px; }
          .docon-badge { background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .body-content { padding: 24px; }
          .patient-bar { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .patient-item span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .patient-item strong { font-size: 15px; color: #0f172a; }
          .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 24px; }
          .vital-box { text-align: center; }
          .vital-label { font-size: 11px; color: #64748b; }
          .vital-val { font-size: 14px; font-weight: 700; color: #0284c7; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 16px 0 10px; }
          .rx-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .rx-table th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 12px; color: #475569; }
          .rx-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .med-name { font-weight: 600; color: #0f172a; }
          .med-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
          .advice-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #78350f; margin-bottom: 20px; }
          .footer { text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          .actions { display: flex; gap: 12px; margin-top: 20px; }
          .btn { flex: 1; padding: 12px; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
          .btn-print { background: #0284c7; color: white; }
          .btn-delete { background: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="clinic-info">
              <h2>${rx.doctor.name}</h2>
              <p>${rx.doctor.specialization} &bull; ${rx.doctor.qualification}</p>
              <p style="margin-top: 4px; font-size: 11px;">${rx.doctor.clinicName}</p>
            </div>
            <div class="docon-badge">docon &bull; PharmEasy</div>
          </div>
          <div class="body-content">
            <div class="patient-bar">
              <div class="patient-item">
                <span>Patient</span>
                <strong>${rx.patient.name}</strong>
              </div>
              <div class="patient-item">
                <span>Age / Sex</span>
                <strong>${rx.patient.age} Y / ${rx.patient.gender}</strong>
              </div>
              <div class="patient-item">
                <span>Date</span>
                <strong>${rx.dayFormatted} ${rx.monthFormatted} ${rx.year}</strong>
              </div>
            </div>

            <div class="vitals-grid">
              <div class="vital-box"><div class="vital-label">Weight</div><div class="vital-val">${rx.vitals?.weight || '-'}</div></div>
              <div class="vital-box"><div class="vital-label">Temp</div><div class="vital-val">${rx.vitals?.temperature || '-'}</div></div>
              <div class="vital-box"><div class="vital-label">Pulse</div><div class="vital-val">${rx.vitals?.pulse || '-'}</div></div>
              <div class="vital-box"><div class="vital-label">SpO2</div><div class="vital-val">${rx.vitals?.spo2 || '-'}</div></div>
            </div>

            <div class="section-title">Diagnosis</div>
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #1e293b;">${rx.diagnosis}</p>

            <div class="section-title">Prescribed Medicines (Rx)</div>
            <table class="rx-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage & Frequency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${rx.medicines.map((m) => `
                  <tr>
                    <td>
                      <div class="med-name">${m.name}</div>
                      <div class="med-sub">${m.instructions} &bull; ${m.timing}</div>
                    </td>
                    <td><strong>${m.dosage}</strong><br><span style="color: #64748b; font-size: 11px;">${m.frequency}</span></td>
                    <td>${m.duration}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title">Advice & Instructions</div>
            <div class="advice-box">${rx.generalAdvice}</div>

            <div class="actions">
              <button class="btn btn-print" onclick="window.print()">🖨️ Print / Download PDF</button>
              <a href="/api/prescriptions/delete-by-token/${rx.deleteToken}" class="btn btn-delete">🗑️ Delete Record</a>
            </div>
          </div>
          <div class="footer">
            Digitally signed by ${rx.doctor.name} &bull; Powered by DocOn by PharmEasy
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Server Error loading prescription: ' + error.message);
  }
});

// Start Server & Connect to DB
const startServer = async () => {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` DocOn & Telehealth Backend running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Doctors API: http://localhost:${PORT}/api/doctors`);
    console.log(` Prescriptions API: http://localhost:${PORT}/api/prescriptions?grouped=true`);
    console.log(` Payments API: http://localhost:${PORT}/api/payments/latest`);
    console.log(` Notifications API: http://localhost:${PORT}/api/notifications`);
    console.log(` Public Web Rx View: http://localhost:${PORT}/view/Sep25_2026`);
    console.log(`=======================================================`);
  });
};

startServer();
module.exports = app;
