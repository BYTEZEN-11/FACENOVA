const { createClient } = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

let client = null;
let isConnected = false;

async function connectRedis() {
  if (isConnected && client) {
    logger.info('Redis already connected');
    return client;
  }

  try {
    client = createClient({
      url: config.redis.url,
      password: config.redis.password,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries reached, giving up');
            return new Error('Redis max retries reached');
          }

          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on('error', (err) => {
      logger.error('Redis client error:', err);
      isConnected = false;
    });

    client.on('connect', () => {
      isConnected = true;
      logger.info('Redis client connected');
    });

    client.on('ready', () => logger.info('Redis client ready'));
    client.on('reconnecting', () => logger.warn('Redis client reconnecting'));
    client.on('end', () => {
      isConnected = false;
      logger.warn('Redis client connection ended');
    });

    await client.connect();
    return client;
  } catch (err) {
    logger.warn('Redis not available, continuing with cache disabled:', err.message);
    isConnected = false;
    client = null;
    return null;
  }
}

async function disconnectRedis() {
  if (!isConnected || !client) return;
  try {
    await client.quit();
    isConnected = false;
    client = null;
  } catch (err) {
    logger.error('Error disconnecting Redis:', err);
    throw err;
  }
}

function getClient() {
  if (!isConnected || !client) {
    throw new Error('Redis client not connected. Call connectRedis() first.');
  }
  return client;
}

function isReady() {
  return isConnected && client !== null;
}

module.exports = { connectRedis, disconnectRedis, getClient, isReady };
