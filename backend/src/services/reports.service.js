const Report = require('../models/report.model');
const mongoose = require('mongoose');
const { ApiError } = require('../middleware/error.middleware');
const cache = require('../utils/cache');
const { PAGINATION, CACHE_TTL } = require('../config/constants');

function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listReports(userId, options = {}) {
  const { type, classification, search } = options;
  const page = options.page ?? PAGINATION.REPORTS_DEFAULT_PAGE;
  const limit = options.limit ?? PAGINATION.REPORTS_DEFAULT_LIMIT;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(
    PAGINATION.REPORTS_MAX_LIMIT,
    Math.max(1, parseInt(limit, 10))
  );
  const skip = (pageNum - 1) * limitNum;

  const filter = { userId };
  if (type) filter.inputType = type;
  if (classification) filter['analysis.classification'] = classification;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { inputContent: { $regex: safe, $options: 'i' } },
      { tags: { $in: [new RegExp(safe, 'i')] } },
    ];
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-metadata.ipAddress -metadata.userAgent')
      .lean(),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };
}

async function getReportById(reportId, userId) {
  const report = await Report.findOne({ _id: reportId, userId })
    .select('-metadata.ipAddress -metadata.userAgent')
    .lean();

  if (!report) {
    throw new ApiError(404, 'REPORT_NOT_FOUND', 'Report not found');
  }
  return report;
}

async function deleteReport(reportId, userId) {
  const result = await Report.deleteOne({ _id: reportId, userId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'REPORT_NOT_FOUND', 'Report not found');
  }

  await cache.delPattern(`stats:user:${userId}:*`);
  return { success: true };
}

async function getUserStats(userId) {
  const cacheKey = `stats:user:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const [
    totalReports,
    classificationCounts,
    recentReports,
    avgTrustScore,
  ] = await Promise.all([
    Report.countDocuments({ userId }),
    Report.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      { $group: { _id: '$analysis.classification', count: { $sum: 1 } } },
    ]),
    Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('inputType inputContent analysis.trustScore analysis.classification createdAt')
      .lean(),
    Report.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      { $group: { _id: null, avg: { $avg: '$analysis.trustScore' } } },
    ]),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyCounts = await Report.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId.toString()),
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        realCount: {
          $sum: { $cond: [{ $eq: ['$analysis.classification', 'real'] }, 1, 0] },
        },
        fakeCount: {
          $sum: { $cond: [{ $eq: ['$analysis.classification', 'fake'] }, 1, 0] },
        },
        suspiciousCount: {
          $sum: { $cond: [{ $eq: ['$analysis.classification', 'suspicious'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const stats = {
    totalReports,
    classificationBreakdown: classificationCounts.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, { real: 0, fake: 0, suspicious: 0 }),
    avgTrustScore: avgTrustScore[0]?.avg ? Math.round(avgTrustScore[0].avg * 10) / 10 : 0,
    recentReports,
    dailyTrend: dailyCounts,
  };

  await cache.set(cacheKey, stats, CACHE_TTL.USER_STATS);
  return stats;
}

module.exports = {
  listReports,
  getReportById,
  deleteReport,
  getUserStats,
};
