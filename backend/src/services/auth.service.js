const User = require('../models/user.model');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { ApiError } = require('../middleware/error.middleware');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { CACHE_TTL } = require('../config/constants');

async function register({ name, email, password }, metadata = {}) {

  const { valid, errors } = validatePasswordStrength(password);
  if (!valid) {
    throw new ApiError(400, 'WEAK_PASSWORD', errors.join('. '));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password, 
    metadata: {
      signupIp: metadata.ip,
      userAgent: metadata.userAgent,
    },
  });

  logger.info(`New user registered: ${user.email}`);

  const tokens = generateTokens(user);

  await storeRefreshToken(user._id, tokens.refreshToken);

  return {
    user: user.toPublicJSON(),
    ...tokens,
  };
}

async function login(email, password, metadata = {}) {

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'ACCOUNT_DISABLED', 'Account has been disabled');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();

  logger.info(`User logged in: ${user.email}`);

  const tokens = generateTokens(user);
  await storeRefreshToken(user._id, tokens.refreshToken);

  return {
    user: user.toPublicJSON(),
    ...tokens,
  };
}

async function refreshAccessToken(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', err.message);
  }

  const newTokens = generateTokens({ _id: decoded.userId, email: decoded.email, role: decoded.role });

  const updated = await User.findOneAndUpdate(
    { _id: decoded.userId, refreshToken },
    { $set: { refreshToken: newTokens.refreshToken } },
    { new: true }
  ).select('+refreshToken');

  if (!updated) {

    await User.findByIdAndUpdate(decoded.userId, { $unset: { refreshToken: 1 } });
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or revoked');
  }

  if (!updated.isActive) {
    throw new ApiError(403, 'ACCOUNT_DISABLED', 'Account has been disabled');
  }

  await cache.set(
    `user:session:${updated._id}`,
    { token: newTokens.refreshToken },
    CACHE_TTL.USER_SESSION
  );

  return newTokens;
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  await cache.del(`user:session:${userId}`);
  logger.info(`User logged out: ${userId}`);
}

function generateTokens(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

async function storeRefreshToken(userId, token) {
  await User.findByIdAndUpdate(userId, { refreshToken: token });

  await cache.set(`user:session:${userId}`, { token }, CACHE_TTL.USER_SESSION);
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  return user ? user.toPublicJSON() : null;
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getUserById,
};
