const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/analyze', require('./analyze.routes'));
router.use('/reports', require('./reports.routes'));

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Fake News Detection API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      analyze: '/api/analyze',
      reports: '/api/reports',
    },
  });
});

module.exports = router;
