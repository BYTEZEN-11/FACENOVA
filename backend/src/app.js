const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/error.middleware');
const { errorHandler } = errorMiddleware;
const apiRouter = require('./routes');

const app = express();

app.set('trust proxy', config.http.trustProxy);

app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = config.cors.origin.split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use('/api/', limiter);

const { LIMITS } = require('./config/constants');

app.use(cookieParser());
app.use(express.json({ limit: LIMITS.BODY_JSON_MAX }));
app.use(express.urlencoded({ extended: true, limit: LIMITS.BODY_URLENCODED_MAX }));
app.use(compression());

app.use(mongoSanitize({ replaceWith: '_' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Fake News Detection API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      analyze: '/api/analyze',
      reports: '/api/reports',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

app.use(errorHandler);

module.exports = app;
