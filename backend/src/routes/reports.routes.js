const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { protect } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

router.get('/stats', protect, asyncHandler(reportsController.getStats));
router.get('/', protect, asyncHandler(reportsController.listReports));
router.get('/:id', protect, asyncHandler(reportsController.getReport));
router.delete('/:id', protect, asyncHandler(reportsController.deleteReport));

module.exports = router;
