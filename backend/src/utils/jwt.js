const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

function generateAccessToken(payload) {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'fake-news-api',
      audience: 'fake-news-client',
    });
  } catch (err) {
    logger.error('Error generating access token:', err);
    throw new Error('Token generation failed');
  }
}

function generateRefreshToken(payload) {
  try {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  } catch (err) {
    logger.error('Error generating refresh token:', err);
    throw new Error('Refresh token generation failed');
  }
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'fake-news-api',
      audience: 'fake-news-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Token expired');
      error.code = 'TOKEN_EXPIRED';
      throw error;
    }
    if (err.name === 'JsonWebTokenError') {
      const error = new Error('Invalid token');
      error.code = 'INVALID_TOKEN';
      throw error;
    }
    throw err;
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (decoded.type !== 'refresh') {
      const error = new Error('Not a refresh token');
      error.code = 'INVALID_TOKEN_TYPE';
      throw error;
    }
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Refresh token expired');
      error.code = 'REFRESH_EXPIRED';
      throw error;
    }
    throw err;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
