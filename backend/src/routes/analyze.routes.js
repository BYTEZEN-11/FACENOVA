const express = require('express');
const multer = require('multer');
const router = express.Router();
const analyzeController = require('../controllers/analyze.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { textValidation, urlValidation } = require('../validators/analyze.validator');
const { asyncHandler } = require('../middleware/error.middleware');
const config = require('../config');
const { LIMITS } = require('../config/constants');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.IMAGE_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF allowed.'));
    }
  },
});

const analysisLimiter = require('express-rate-limit')({
  windowMs: config.analysis.rateLimit.windowMs,
  max: config.analysis.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'ANALYSIS_RATE_LIMIT',
      message: 'Analysis quota exceeded. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/text',
  protect,
  analysisLimiter,
  textValidation,
  validate,
  asyncHandler(analyzeController.analyzeText)
);
router.post(
  '/url',
  protect,
  analysisLimiter,
  urlValidation,
  validate,
  asyncHandler(analyzeController.analyzeUrl)
);
router.post(
  '/image',
  protect,
  analysisLimiter,
  upload.single('image'),
  asyncHandler(analyzeController.analyzeImage)
);

module.exports = router;
