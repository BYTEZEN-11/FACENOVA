const analyzeService = require('../services/analyze.service');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

const analyzeText = asyncHandler(async (req, res) => {
  const { text, options = {} } = req.body;
  const startTime = Date.now();

  const report = await analyzeService.analyzeText(text, req.userId, {
    ...options,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const totalTime = Date.now() - startTime;
  logger.info(`Text analysis completed for user ${req.userId} in ${totalTime}ms`);

  res.json({
    success: true,
    data: {
      reportId: report._id,
      analysis: report.analysis,
      extractedClaims: report.extractedClaims,
      sources: report.sources,
      processingTime: report.metadata?.processingTime,
      totalTime,
    },
  });
});

const analyzeUrl = asyncHandler(async (req, res) => {
  const { url, options = {} } = req.body;
  const startTime = Date.now();

  const report = await analyzeService.analyzeUrl(url, req.userId, {
    ...options,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const totalTime = Date.now() - startTime;
  logger.info(`URL analysis completed for user ${req.userId} in ${totalTime}ms`);

  res.json({
    success: true,
    data: {
      reportId: report._id,
      analysis: report.analysis,
      extractedClaims: report.extractedClaims,
      sources: report.sources,
      processingTime: report.metadata?.processingTime,
      totalTime,
    },
  });
});

const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_IMAGE', message: 'No image file provided' },
    });
  }

  const startTime = Date.now();
  const report = await analyzeService.analyzeImage(
    req.file.buffer,
    req.file.originalname,
    req.userId,
    { ip: req.ip, userAgent: req.headers['user-agent'] }
  );

  const totalTime = Date.now() - startTime;
  logger.info(`Image analysis completed for user ${req.userId} in ${totalTime}ms`);

  res.json({
    success: true,
    data: {
      reportId: report._id,
      analysis: report.analysis,
      extractedClaims: report.extractedClaims,
      sources: report.sources,
      processingTime: report.metadata?.processingTime,
      totalTime,
    },
  });
});

module.exports = {
  analyzeText,
  analyzeUrl,
  analyzeImage,
};
