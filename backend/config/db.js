const mongoose = require('mongoose');

/**
 * Connects to MongoDB if a URI is configured.
 * Returns true when connected, false if skipped or unavailable.
 */
async function connectDatabase(mongoUri) {
  if (!mongoUri) {
    console.warn('[db] MONGODB_URI not set; running without persistent query logging.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    return false;
  }
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDatabaseConnected,
};
