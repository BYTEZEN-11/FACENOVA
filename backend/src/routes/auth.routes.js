const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} = require('../validators/auth.validator');
const { asyncHandler } = require('../middleware/error.middleware');
const config = require('../config');

const authLimiter = require('express-rate-limit')({
  windowMs: config.auth.rateLimit.windowMs,
  max: config.auth.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many auth attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  asyncHandler(authController.register)
);
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  asyncHandler(authController.login)
);
router.post(
  '/refresh',
  refreshTokenValidation,
  validate,
  asyncHandler(authController.refresh)
);
router.post('/logout', protect, asyncHandler(authController.logout));
router.get('/me', protect, asyncHandler(authController.getMe));

module.exports = router;
