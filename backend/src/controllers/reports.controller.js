const reportsService = require('../services/reports.service');
const { asyncHandler } = require('../middleware/error.middleware');

const listReports = asyncHandler(async (req, res) => {
  const { page, limit, type, classification, search } = req.query;
  const result = await reportsService.listReports(req.userId, {
    page,
    limit,
    type,
    classification,
    search,
  });

  res.json({
    success: true,
    data: result,
  });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getReportById(req.params.id, req.userId);
  res.json({
    success: true,
    data: { report },
  });
});

const deleteReport = asyncHandler(async (req, res) => {
  const result = await reportsService.deleteReport(req.params.id, req.userId);
  res.json({
    success: true,
    data: result,
  });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await reportsService.getUserStats(req.userId);
  res.json({
    success: true,
    data: stats,
  });
});

module.exports = {
  listReports,
  getReport,
  deleteReport,
  getStats,
};
