import { LIMITS } from './constants';

const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>]/;

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(value) ? '' : 'Please enter a valid email';
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < LIMITS.PASSWORD_MIN) {
      return `Password must be at least ${LIMITS.PASSWORD_MIN} characters`;
    }
    if (value.length > LIMITS.PASSWORD_MAX) {
      return `Password must be less than ${LIMITS.PASSWORD_MAX} characters`;
    }
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/\d/.test(value)) return 'Password must contain a number';
    if (!PASSWORD_SPECIAL_CHARS.test(value)) {
      return 'Password must contain a special character';
    }
    return '';
  },

  name: (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > LIMITS.NAME_MAX) {
      return `Name must be less than ${LIMITS.NAME_MAX} characters`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name contains invalid characters';
    return '';
  },

  url: (value) => {
    if (!value) return 'URL is required';
    if (value.length > LIMITS.URL_MAX) {
      return `URL must be less than ${LIMITS.URL_MAX} characters`;
    }
    try {
      const u = new URL(value);
      if (!['http:', 'https:'].includes(u.protocol)) {
        return 'URL must use http or https';
      }
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  },

  text: (value, min = LIMITS.TEXT_MIN, max = LIMITS.TEXT_MAX) => {
    if (!value) return 'Text is required';
    if (value.length < min) return `Text must be at least ${min} characters`;
    if (value.length > max) return `Text must be less than ${max} characters`;
    return '';
  },
};

export function validateForm(values, rules) {
  const errors = {};
  for (const field in rules) {
    const rule = rules[field];
    const value = values[field];
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) errors[field] = error;
    } else if (rule.required && !value) {
      errors[field] = `${field} is required`;
    }
  }
  return errors;
}
