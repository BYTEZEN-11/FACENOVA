require('dotenv').config();

const { RATE_LIMITS, TIMEOUTS, MONGO, AUTH, LOG, HTTP, APP } = require('./constants');

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || HTTP.DEFAULT_PORT,
  apiVersion: process.env.API_VERSION || HTTP.API_VERSION,
  name: APP.NAME,
  version: APP.VERSION,

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fake_news_db',
    options: {
      maxPoolSize: MONGO.MAX_POOL,
      minPoolSize: MONGO.MIN_POOL,
      socketTimeoutMS: MONGO.SOCKET_TIMEOUT_MS,
      serverSelectionTimeoutMS: MONGO.SERVER_SELECTION_TIMEOUT_MS,
    },
  },

  redis: (() => {

    const password = process.env.REDIS_PASSWORD;
    if (password) {
      return {
        url: process.env.REDIS_URL || `redis://:${encodeURIComponent(password)}@redis:6379`,
        password,
      };
    }
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: undefined,
    };
  })(),

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || AUTH.ACCESS_TOKEN_LIFETIME,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || AUTH.REFRESH_TOKEN_LIFETIME,
    issuer: AUTH.ISSUER,
    audience: AUTH.AUDIENCE,
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    apiKey: process.env.AI_SERVICE_API_KEY,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || TIMEOUTS.AI_SERVICE_MS,
    healthTimeout: TIMEOUTS.AI_SERVICE_HEALTHCHECK_MS,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || RATE_LIMITS.GLOBAL_WINDOW_MS,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || RATE_LIMITS.GLOBAL_MAX,
  },

  auth: {
    rateLimit: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || RATE_LIMITS.AUTH_WINDOW_MS,
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || RATE_LIMITS.AUTH_MAX,
    },
  },

  analysis: {
    rateLimit: {
      windowMs:
        parseInt(process.env.ANALYSIS_RATE_LIMIT_WINDOW_MS, 10) || RATE_LIMITS.ANALYSIS_WINDOW_MS,
      max: parseInt(process.env.ANALYSIS_RATE_LIMIT_MAX, 10) || RATE_LIMITS.ANALYSIS_MAX,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || LOG.DEFAULT_LEVEL,
    dir: process.env.LOG_DIR || LOG.DEFAULT_DIR,
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || AUTH.BCRYPT_ROUNDS,
  },

  externalApis: {
    factCheckApiKey: process.env.FACT_CHECK_API_KEY || '',
    whoisApiKey: process.env.WHOIS_API_KEY || '',
  },

  http: {
    trustProxy: HTTP.TRUST_PROXY,
    gracefulShutdownMs: HTTP.GRACEFUL_SHUTDOWN_MS,
  },
};

function validate() {
  const errors = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be set and at least 32 characters (set in .env)');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be set and at least 32 characters (set in .env)');
  }
  if (!process.env.AI_SERVICE_API_KEY || process.env.AI_SERVICE_API_KEY.length < 16) {
    errors.push('AI_SERVICE_API_KEY must be set and at least 16 characters (set in .env)');
  }

  if (config.env === 'production') {
    if (!process.env.MONGODB_URI) errors.push('MONGODB_URI is required in production');
    if (!process.env.REDIS_PASSWORD || process.env.REDIS_PASSWORD.length < 16) {
      errors.push('REDIS_PASSWORD must be at least 16 characters in production');
    }
    if (!process.env.MONGO_ROOT_PASSWORD || process.env.MONGO_ROOT_PASSWORD.length < 16) {
      errors.push('MONGO_ROOT_PASSWORD must be at least 16 characters in production');
    }
  }

  if (errors.length > 0) {
    console.error('\n[CONFIG ERROR] Missing or insecure configuration:');
    errors.forEach((e) => console.error('  ✗', e));
    console.error('\nCopy backend/.env.example to backend/.env and fill in the values.\n');
    process.exit(1);
  }
}

validate();

module.exports = config;
