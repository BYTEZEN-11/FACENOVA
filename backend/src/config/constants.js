const SCORE = {
  REAL_THRESHOLD: 65,
  FAKE_THRESHOLD: 35,

  REPUTATION_TRUSTED: 80,
  REPUTATION_RELIABLE: 60,
  REPUTATION_QUESTIONABLE: 40,
  REPUTATION_UNRELIABLE: 20,

  SOURCE_DAMPEN_LOW: 20,
  SOURCE_DAMPEN_VERY_LOW: 40,
  ADJUST_WEIGHT_AI: 0.8,
  ADJUST_WEIGHT_SOURCE: 0.2,
};

const SOURCE_DAMPING = {
  VERY_LOW_MULTIPLIER: 0.6,
  LOW_MULTIPLIER: 0.8,
};

const LIMITS = {
  TEXT_MAX_LEN: 50000,
  TEXT_MIN_LEN: 10,
  TEXT_AI_INPUT: 10000, 
  URL_MAX_LEN: 2048,
  IMAGE_MAX_BYTES: 10 * 1024 * 1024,
  IMAGE_MIN_BYTES: 8,
  BODY_JSON_MAX: '10mb',
  BODY_URLENCODED_MAX: '10mb',
};

const RATE_LIMITS = {
  GLOBAL_WINDOW_MS: 60 * 1000, 
  GLOBAL_MAX: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, 
  AUTH_MAX: 10,
  ANALYSIS_WINDOW_MS: 60 * 60 * 1000, 
  ANALYSIS_MAX: 50,
};

const CACHE_TTL = {
  ANALYSIS_TEXT: 24 * 60 * 60,
  SOURCE_DOMAIN: 7 * 24 * 60 * 60,
  USER_STATS: 5 * 60,
  USER_SESSION: 7 * 24 * 60 * 60,
};

const TIMEOUTS = {
  AI_SERVICE_MS: 30000,
  AI_SERVICE_HEALTHCHECK_MS: 5000,
  URL_FETCH_MS: 15000,
  URL_MAX_CONTENT_BYTES: 1024 * 1024, 
};

const MONGO = {
  MAX_POOL: 50,
  MIN_POOL: 5,
  SOCKET_TIMEOUT_MS: 45000,
  SERVER_SELECTION_TIMEOUT_MS: 10000,
};

const PAGINATION = {
  REPORTS_DEFAULT_PAGE: 1,
  REPORTS_DEFAULT_LIMIT: 20,
  REPORTS_MAX_LIMIT: 100,
};

const SOURCE_DEFAULTS = {
  NEUTRAL_SCORE: 50,
  TRUSTED_TLD_BONUS: 20,
  SUSPICIOUS_TLD_PENALTY: 25,
  NUMERIC_DOMAIN_PENALTY: 10,
  EXCESSIVE_HYPHENS: 3,
  EXCESSIVE_HYPHENS_PENALTY: 15,
  LONG_DOMAIN_LENGTH: 30,
  LONG_DOMAIN_PENALTY: 5,
  SENSATIONALIST_PENALTY: 15,
  IMPERSONATION_PENALTY: 5,
  SOURCE_CACHE_TTL_DAYS: 7,
  TLD_TRUSTED: ['gov', 'edu', 'org'],
  TLD_SUSPICIOUS: ['xyz', 'top', 'click', 'loan', 'tk', 'ml', 'ga', 'cf'],
  SENSATIONAL_KEYWORDS: ['truth', 'exposed', 'leaked', 'scandal', 'shocking', 'revealed'],
  IMPERSONATION_HINTS: ['news', 'times', 'post', 'herald', 'tribune', 'cnn', 'bbc', 'reuters'],
};

const SOURCE_LISTS = {
  TRUSTED_DOMAINS: {
    'reuters.com': 96,
    'apnews.com': 95,
    'bbc.com': 94,
    'bbc.co.uk': 94,
    'npr.org': 92,
    'pbs.org': 91,
    'nytimes.com': 89,
    'washingtonpost.com': 88,
    'theguardian.com': 88,
    'wsj.com': 89,
    'latimes.com': 86,
    'economist.com': 90,
    'cnn.com': 82,
    'nbcnews.com': 84,
    'cbsnews.com': 83,
    'abcnews.go.com': 83,
    'usatoday.com': 82,
    'time.com': 83,
    'newsweek.com': 78,
    'forbes.com': 80,
    'bloomberg.com': 90,
    'politico.com': 84,
    'axios.com': 85,
    'snopes.com': 95,
    'factcheck.org': 96,
    'politifact.com': 93,
    'fullfact.org': 92,
    'apfactcheck.com': 94,
    'who.int': 96,
    'cdc.gov': 96,
    'nih.gov': 95,
    'gov': 95,
    'gov.uk': 95,
    'europa.eu': 95,
  },
  SATIRE_DOMAINS: {
    'theonion.com': 75,
    'babylonbee.com': 75,
    'clickhole.com': 70,
    'thehardtimes.net': 70,
    'satirewire.com': 70,
  },
  SUSPICIOUS_DOMAINS: {
    'empiresports.co': 15,
    'worldnewsdailyreport.com': 5,
    'empirenews.net': 5,
    'huzlers.com': 5,
    'nationalreport.net': 5,
    'newswatch33.com': 5,
    'yournewswire.com': 5,
    'naturalnews.com': 15,
    'infowars.com': 10,
  },
};

const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_DIGIT: true,
  REQUIRE_SPECIAL: true,

  SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',
};

const AUTH = {
  ACCESS_TOKEN_LIFETIME: '15m',
  REFRESH_TOKEN_LIFETIME: '7d',
  BCRYPT_ROUNDS: 12,
  ISSUER: 'fake-news-api',
  AUDIENCE: 'fake-news-client',
};

const HTTP = {
  DEFAULT_PORT: 5000,
  API_VERSION: 'v1',
  TRUST_PROXY: 1, 
  GRACEFUL_SHUTDOWN_MS: 30000,
};

const LOG = {
  DEFAULT_LEVEL: 'info',
  DEFAULT_DIR: './logs',
  FILE_ROTATION_MAX_SIZE: '20m',
  FILE_ROTATION_MAX_FILES: '14d',
};

const SSRF = {
  BLOCKED_HOSTS: new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', 
    'metadata.google.internal',
    'metadata.azure.com',
  ]),
  EXCERPT_MAX_LEN: 240,
  ARTICLE_CONTENT_MAX_LEN: 50000,
};

const APP = {
  NAME: 'AI Fake News Detection API',
  VERSION: '1.0.0',
};

module.exports = {
  SCORE,
  SOURCE_DAMPING,
  LIMITS,
  RATE_LIMITS,
  CACHE_TTL,
  TIMEOUTS,
  MONGO,
  PAGINATION,
  SOURCE_DEFAULTS,
  SOURCE_LISTS,
  PASSWORD_RULES,
  AUTH,
  HTTP,
  LOG,
  SSRF,
  APP,
};
