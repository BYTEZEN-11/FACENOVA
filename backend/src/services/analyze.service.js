const crypto = require('crypto');
const aiService = require('./ai.service');
const urlExtractor = require('./url-extractor.service');
const sourceCredibility = require('./source-credibility.service');
const Report = require('../models/report.model');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { sanitizeText, sanitizeUrl, truncate } = require('../utils/sanitize');
const { ApiError } = require('../middleware/error.middleware');
const { SCORE, SOURCE_DAMPING, LIMITS, CACHE_TTL } = require('../config/constants');

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeAIResult(result) {
  if (!result) return result;

  const analysis = result.analysis || result;

  const clamp = (n, lo, hi) =>
    typeof n === 'number' && !Number.isNaN(n) ? Math.max(lo, Math.min(hi, n)) : 0;
  const rawScore = analysis.trust_score ?? analysis.trustScore ?? 0;
  const rawConf = analysis.confidence ?? 0;

  const normalized = {
    analysis: {

      classification: ['real', 'fake', 'suspicious'].includes(analysis.classification)
        ? analysis.classification
        : 'suspicious',
      trustScore: clamp(rawScore, 0, 100),
      confidence: clamp(rawConf, 0, 1),
      reasoning: Array.isArray(analysis.reasoning) ? analysis.reasoning : [],
      indicators: {
        clickbait: clamp(analysis.indicators?.clickbait ?? 0, 0, 100),
        emotionalManipulation: clamp(
          analysis.indicators?.emotional_manipulation ??
            analysis.indicators?.emotionalManipulation ??
            0,
          0,
          100
        ),
        sensationalism: clamp(analysis.indicators?.sensationalism ?? 0, 0, 100),
        misleadingPatterns: clamp(
          analysis.indicators?.misleading_patterns ??
            analysis.indicators?.misleadingPatterns ??
            0,
          0,
          100
        ),
      },
    },
    extractedClaims: (result.extracted_claims || result.extractedClaims || []).map((c) => ({
      text: typeof c.text === 'string' ? c.text : '',
      verified: Boolean(c.verified),
      confidence: clamp(c.confidence ?? 0, 0, 1),
      sources: Array.isArray(c.sources) ? c.sources : [],
      verificationNote: c.verification_note ?? c.verificationNote ?? undefined,
    })),
    sources: (result.sources || []).map((s) => ({
      name: s.name || s.url || 'unknown',
      url: s.url ?? undefined,
      credibilityScore: clamp(s.credibility_score ?? s.credibilityScore ?? 50, 0, 100),
      agreement: ['supports', 'disputes', 'neutral', 'unverified', 'source_evaluated'].includes(
        s.agreement
      )
        ? s.agreement
        : 'unverified',
    })),
    processingTime: result.processing_time ?? result.processingTime ?? 0,
    modelVersions: result.model_versions ?? result.modelVersions ?? {},
  };

  return normalized;
}

async function analyzeText(text, userId, options = {}) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'Text content is required');
  }
  const sanitized = sanitizeText(text);
  const truncated = truncate(sanitized, LIMITS.TEXT_MAX_LEN);
  const hash = hashContent(truncated);

  const cacheKey = `analysis:text:${hash}`;
  let result = await cache.get(cacheKey);

  if (!result) {

    result = normalizeAIResult(await aiService.analyzeText(truncated, options));
    await cache.set(cacheKey, result, CACHE_TTL.ANALYSIS_TEXT);
  } else {
    logger.debug(`Text analysis cache hit: ${hash}`);
  }

  const report = await Report.create({
    userId,
    inputType: 'text',
    inputContent: truncated,
    inputMetadata: {
      contentLength: truncated.length,
    },
    analysis: result.analysis,
    extractedClaims: result.extractedClaims || [],
    sources: result.sources || [],
    metadata: {
      ipAddress: options.ip,
      userAgent: options.userAgent,
      processingTime: result.processingTime,
      modelVersions: result.modelVersions,
    },
  });

  return report;
}

async function analyzeUrl(url, userId, options = {}) {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    throw new ApiError(400, 'INVALID_URL', 'Invalid URL provided');
  }

  const article = await urlExtractor.extractFromUrl(sanitized);

  const credibility = await sourceCredibility.analyzeCredibility(article.domain);

  const textForAnalysis = truncate(
    `${article.title}\n\n${article.content}`,
    LIMITS.TEXT_AI_INPUT
  );

  const aiResult = normalizeAIResult(await aiService.analyzeUrl(sanitized, textForAnalysis, article.domain));

  const adjustedScore = adjustTrustScoreBySource(
    aiResult.analysis.trustScore,
    credibility.credibilityScore
  );

  const finalAnalysis = {
    ...aiResult.analysis,
    trustScore: Math.round(adjustedScore * 10) / 10,
    sources: [
      ...(aiResult.sources || []),
      {
        name: article.siteName || article.domain,
        url: sanitized,
        credibilityScore: credibility.credibilityScore,
        agreement: 'source_evaluated',
      },
    ],
  };

  if (adjustedScore >= SCORE.REAL_THRESHOLD) finalAnalysis.classification = 'real';
  else if (adjustedScore <= SCORE.FAKE_THRESHOLD) finalAnalysis.classification = 'fake';
  else finalAnalysis.classification = 'suspicious';

  const report = await Report.create({
    userId,
    inputType: 'url',
    inputContent: `${article.title}\n${article.excerpt}`,
    inputMetadata: {
      url: sanitized,
      domain: article.domain,
      contentLength: article.content.length,
    },
    analysis: finalAnalysis,
    extractedClaims: aiResult.extractedClaims || [],
    sources: finalAnalysis.sources,
    metadata: {
      ipAddress: options.ip,
      userAgent: options.userAgent,
      processingTime: aiResult.processingTime,
      modelVersions: aiResult.modelVersions,
    },
  });

  return report;
}

async function analyzeImage(imageBuffer, filename, userId, options = {}) {

  const result = normalizeAIResult(await aiService.analyzeImage(imageBuffer, filename));

  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

  const report = await Report.create({
    userId,
    inputType: 'image',
    inputContent: filename || 'image',
    inputMetadata: {
      imageHash,
    },
    analysis: result.analysis,
    extractedClaims: result.extractedClaims || [],
    sources: result.sources || [],
    metadata: {
      ipAddress: options.ip,
      userAgent: options.userAgent,
      processingTime: result.processingTime,
      modelVersions: result.modelVersions,
    },
  });

  return report;
}

function adjustTrustScoreBySource(aiScore, sourceCredibility) {

  const weighted =
    aiScore * SCORE.ADJUST_WEIGHT_AI + sourceCredibility * SCORE.ADJUST_WEIGHT_SOURCE;

  let adjusted = weighted;
  if (sourceCredibility < SOURCE_DAMPING.SOURCE_DAMPEN_VERY_LOW) {
    adjusted *= SOURCE_DAMPING.VERY_LOW_MULTIPLIER;
  } else if (sourceCredibility < SOURCE_DAMPING.SOURCE_DAMPEN_LOW) {
    adjusted *= SOURCE_DAMPING.LOW_MULTIPLIER;
  }

  return Math.max(0, Math.min(100, adjusted));
}

module.exports = {
  analyzeText,
  analyzeUrl,
  analyzeImage,
};
