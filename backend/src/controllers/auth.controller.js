const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(
    { name, email, password },
    { ip: req.ip, userAgent: req.headers['user-agent'] }
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    message: 'Token refreshed',
    data: tokens,
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.userId);
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  res.json({
    success: true,
    data: { user },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
