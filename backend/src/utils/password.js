const bcrypt = require('bcrypt');
const config = require('../config');
const { PASSWORD_RULES } = require('../config/constants');

const SALT_ROUNDS = config.bcrypt.rounds;

const SPECIAL_CHAR_CLASS = '[' + PASSWORD_RULES.SPECIAL_CHARS.replace(/[\\\]\^]/g, '\\$&') + ']';

async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

function validatePasswordStrength(password) {
  const errors = [];
  const rules = PASSWORD_RULES;

  if (!password || password.length < rules.MIN_LENGTH) {
    errors.push(`Password must be at least ${rules.MIN_LENGTH} characters`);
  }
  if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (rules.REQUIRE_DIGIT && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (rules.REQUIRE_SPECIAL && !new RegExp(SPECIAL_CHAR_CLASS).test(password)) {
    errors.push(`Password must contain at least one special character (${rules.SPECIAL_CHARS})`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
