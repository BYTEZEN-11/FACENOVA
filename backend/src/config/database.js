const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    logger.info('MongoDB already connected');
    return mongoose.connection;
  }

  try {

    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('MongoDB reconnected');
    });

    await mongoose.connect(config.database.uri, config.database.options);

    return mongoose.connection;
  } catch (err) {
    logger.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err);
    throw err;
  }
}

function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,

  };
}

module.exports = { connectDB, disconnectDB, getConnectionStatus };
