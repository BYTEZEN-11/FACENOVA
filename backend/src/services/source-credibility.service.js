const SourceCache = require('../models/sourceCache.model');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { SOURCE_DEFAULTS, SOURCE_LISTS, CACHE_TTL, SCORE } = require('../config/constants');

const { TRUSTED_DOMAINS, SATIRE_DOMAINS, SUSPICIOUS_DOMAINS } = SOURCE_LISTS;

function normalize(domain) {
  return String(domain || '').toLowerCase().replace(/^www\./, '');
}

async function analyzeCredibility(domain) {
  if (!domain) return defaultCredibility();

  const normalized = normalize(domain);

  const cacheKey = `source:domain:${normalized}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    logger.debug(`Source credibility cache hit: ${normalized}`);
    return cached;
  }

  const curated = curatedResult(normalized);
  if (curated) {
    await cache.set(cacheKey, curated, CACHE_TTL.SOURCE_DOMAIN);
    return curated;
  }

  const result = computeCredibility(normalized);

  await cache.set(cacheKey, result, CACHE_TTL.SOURCE_DOMAIN);
  try {
    await SourceCache.findOneAndUpdate(
      { domain: normalized },
      {
        domain: normalized,
        credibilityScore: result.credibilityScore,
        reputation: result.reputation,
        lastChecked: new Date(),
        $inc: { checkCount: 1 },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.debug('SourceCache write failed:', err.message);
  }

  return result;
}

function curatedResult(normalized) {
  if (TRUSTED_DOMAINS[normalized]) {
    return {
      credibilityScore: TRUSTED_DOMAINS[normalized],
      reputation: 'trusted',
      factors: ['known_trusted_outlet'],
    };
  }
  if (SUSPICIOUS_DOMAINS[normalized]) {
    return {
      credibilityScore: SUSPICIOUS_DOMAINS[normalized],
      reputation: 'unreliable',
      factors: ['flagged_unreliable'],
    };
  }
  if (SATIRE_DOMAINS[normalized]) {
    return {
      credibilityScore: SATIRE_DOMAINS[normalized],
      reputation: 'satire',
      factors: ['satire_outlet', 'tag_as_opinion'],
    };
  }
  return null;
}

function computeCredibility(domain) {
  const factors = [];
  let score = SOURCE_DEFAULTS.NEUTRAL_SCORE;

  const tld = domain.split('.').pop();
  if (SOURCE_DEFAULTS.TLD_TRUSTED.includes(tld)) {
    score += SOURCE_DEFAULTS.TRUSTED_TLD_BONUS;
    factors.push('trusted_tld');
  } else if (SOURCE_DEFAULTS.TLD_SUSPICIOUS.includes(tld)) {
    score -= SOURCE_DEFAULTS.SUSPICIOUS_TLD_PENALTY;
    factors.push('suspicious_tld');
  }

  if (/\d{4,}/.test(domain)) {
    score -= SOURCE_DEFAULTS.NUMERIC_DOMAIN_PENALTY;
    factors.push('numeric_domain');
  }

  const hyphens = (domain.match(/-/g) || []).length;
  if (hyphens > SOURCE_DEFAULTS.EXCESSIVE_HYPHENS) {
    score -= SOURCE_DEFAULTS.EXCESSIVE_HYPHENS_PENALTY;
    factors.push('excessive_hyphens');
  }

  if (domain.length > SOURCE_DEFAULTS.LONG_DOMAIN_LENGTH) {
    score -= SOURCE_DEFAULTS.LONG_DOMAIN_PENALTY;
    factors.push('long_domain');
  }

  if (SOURCE_DEFAULTS.SENSATIONAL_KEYWORDS.some((kw) => domain.includes(kw))) {
    score -= SOURCE_DEFAULTS.SENSATIONALIST_PENALTY;
    factors.push('sensationalist_keyword');
  }

  if (
    SOURCE_DEFAULTS.IMPERSONATION_HINTS.some((hint) =>
      new RegExp(`\\b${hint}\\b`, 'i').test(domain)
    )
  ) {
    const isExactMatch = Object.keys(TRUSTED_DOMAINS).some((d) => d === domain);
    if (!isExactMatch) {
      score -= SOURCE_DEFAULTS.IMPERSONATION_PENALTY;
      factors.push('possible_impersonation');
    }
  }

  return {
    credibilityScore: clampScore(score),
    reputation: reputationFor(clampScore(score)),
    factors,
  };
}

function reputationFor(score) {
  if (score >= SCORE.REPUTATION_TRUSTED) return 'trusted';
  if (score >= SCORE.REPUTATION_RELIABLE) return 'reliable';
  if (score >= SCORE.REPUTATION_QUESTIONABLE) return 'questionable';
  if (score >= SCORE.REPUTATION_UNRELIABLE) return 'unreliable';
  return 'unknown';
}

function defaultCredibility() {
  return {
    credibilityScore: SOURCE_DEFAULTS.NEUTRAL_SCORE,
    reputation: 'unknown',
    factors: ['no_domain'],
  };
}

function clampScore(n) {
  return Math.max(0, Math.min(100, n));
}

module.exports = { analyzeCredibility, _internal: { computeCredibility, reputationFor } };
