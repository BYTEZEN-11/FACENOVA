const { body } = require('express-validator');
const { LIMITS } = require('../config/constants');

const textValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ min: LIMITS.TEXT_MIN_LEN, max: LIMITS.TEXT_MAX_LEN })
    .withMessage(`Text must be ${LIMITS.TEXT_MIN_LEN}-${LIMITS.TEXT_MAX_LEN} characters`),

  body('options').optional().isObject().withMessage('Options must be an object'),
  body('options.extractClaims').optional().isBoolean(),
  body('options.factCheck').optional().isBoolean(),
];

const urlValidation = [
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isLength({ max: LIMITS.URL_MAX_LEN })
    .withMessage(`URL must be at most ${LIMITS.URL_MAX_LEN} characters`)
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL'),
];

module.exports = {
  textValidation,
  urlValidation,
};
