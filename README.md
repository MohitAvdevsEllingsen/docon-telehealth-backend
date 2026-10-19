# DocOn & Telehealth API Backend

Express.js REST API with MongoDB (Mongoose) for DocOn digital prescriptions, appointments, payments, and SMS notifications.

## 🚀 Render Deployment Quick Settings

- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Port**: `process.env.PORT` (automatically assigned by Render, defaults to 5000 locally)

### Required Environment Variables on Render:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://krishna-mobile:Mohit_123@cluster0.2zjsb9i.mongodb.net/docon_telehealth?retryWrites=true&w=majority` |
| `DB_NAME` | `docon_telehealth` |
| `JWT_SECRET` | Any strong secret string (e.g. `docon_telehealth_super_secret_jwt_key_2026`) |

## 🧪 Endpoints

- Health Check: `GET /api/health`
- Doctors: `GET /api/doctors`
- Appointments: `GET /api/appointments`
- Prescriptions: `GET /api/prescriptions`
- Payments: `GET /api/payments`
- Web Rx View: `GET /view/:code`
