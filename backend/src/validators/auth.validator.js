const { body } = require('express-validator');
const { PASSWORD_RULES } = require('../config/constants');

const rules = PASSWORD_RULES;

const passwordChain = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: rules.MIN_LENGTH }).withMessage(
    `Password must be at least ${rules.MIN_LENGTH} characters`
  );

if (rules.REQUIRE_UPPERCASE) {
  passwordChain.matches(/[A-Z]/).withMessage('Password must contain an uppercase letter');
}
if (rules.REQUIRE_LOWERCASE) {
  passwordChain.matches(/[a-z]/).withMessage('Password must contain a lowercase letter');
}
if (rules.REQUIRE_DIGIT) {
  passwordChain.matches(/\d/).withMessage('Password must contain a number');
}
if (rules.REQUIRE_SPECIAL) {
  const specialClass = '[' + rules.SPECIAL_CHARS.replace(/[\\\]\^]/g, '\\$&') + ']';
  passwordChain.matches(new RegExp(specialClass)).withMessage(
    `Password must contain a special character (${rules.SPECIAL_CHARS})`
  );
}

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  passwordChain,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
};
