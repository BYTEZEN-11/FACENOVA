const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const logDir = config.logging.dir;

function ensureLogDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (err) {

    console.warn(`logger: cannot create log dir ${dir} (${err.code}); falling back to stdout`);
    return false;
  }
  return true;
}
const logDirReady = ensureLogDir(logDir);

const { combine, timestamp, errors, splat, json, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    let msg = `${ts} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) msg += ` ${JSON.stringify(meta)}`;
    if (stack) msg += `\n${stack}`;
    return msg;
  })
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json()
);

const transports = [
  new winston.transports.Console({
    format: config.env === 'development' ? consoleFormat : fileFormat,
  }),
];

if (logDirReady) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '14d',
      maxSize: '20m',
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '14d',
      maxSize: '20m',
    })
  );
}

const exceptionHandlers = logDirReady
  ? [
      new winston.transports.File({
        filename: path.join(logDir, 'exceptions.log'),
      }),
    ]
  : [new winston.transports.Console({ format: consoleFormat })];

const rejectionHandlers = logDirReady
  ? [
      new winston.transports.File({
        filename: path.join(logDir, 'rejections.log'),
      }),
    ]
  : [new winston.transports.Console({ format: consoleFormat })];

const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: 'fake-news-backend' },
  transports,
  exceptionHandlers,
  rejectionHandlers,
});

module.exports = logger;
