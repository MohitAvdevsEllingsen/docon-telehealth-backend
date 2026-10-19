const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://krishna-mobile:Mohit_123@cluster0.2zjsb9i.mongodb.net/docon_telehealth?retryWrites=true&w=majority';
  const dbName = process.env.DB_NAME || 'docon_telehealth';

  try {
    // Attempt connecting to specified MongoDB with 10s timeout
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });
    const maskedUri = uri.replace(/:([^:@]{2,})@/, ':****@');
    console.log(`[Database] Connected to MongoDB Atlas at: ${maskedUri} (Database: ${mongoose.connection.name})`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Starting MongoMemoryServer fallback for seamless zero-config operation...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to in-memory MongoDB at: ${inMemoryUri}`);
    } catch (inMemErr) {
      console.error('[Database] Failed to connect to any MongoDB instance:', inMemErr.message);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
