const { getClient, isReady } = require('../config/redis');
const logger = require('./logger');

async function get(key) {
  if (!isReady()) {
    logger.warn(`Cache get skipped (Redis not ready): ${key}`);
    return null;
  }
  try {
    const value = await getClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error(`Cache get error for key ${key}:`, err);
    return null;
  }
}

async function set(key, value, ttlSeconds = 3600) {
  if (!isReady()) {
    logger.warn(`Cache set skipped (Redis not ready): ${key}`);
    return false;
  }
  try {
    await getClient().setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    logger.error(`Cache set error for key ${key}:`, err);
    return false;
  }
}

async function del(key) {
  if (!isReady()) return false;
  try {
    await getClient().del(key);
    return true;
  } catch (err) {
    logger.error(`Cache delete error for key ${key}:`, err);
    return false;
  }
}

async function delPattern(pattern) {
  if (!isReady()) return 0;
  try {
    const client = getClient();
    const keys = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      return client.del(keys);
    }
    return 0;
  } catch (err) {
    logger.error(`Cache delete pattern error for ${pattern}:`, err);
    return 0;
  }
}

async function getOrSet(key, fetcher, ttlSeconds = 3600) {
  const cached = await get(key);
  if (cached !== null) {
    logger.debug(`Cache hit: ${key}`);
    return cached;
  }
  logger.debug(`Cache miss: ${key}`);
  const fresh = await fetcher();
  if (fresh !== undefined && fresh !== null) {
    await set(key, fresh, ttlSeconds);
  }
  return fresh;
}

async function incr(key, ttlSeconds) {
  if (!isReady()) return 0;
  try {
    const client = getClient();
    const count = await client.incr(key);
    if (count === 1 && ttlSeconds) {
      await client.expire(key, ttlSeconds);
    }
    return count;
  } catch (err) {
    logger.error(`Cache incr error for ${key}:`, err);
    return 0;
  }
}

module.exports = { get, set, del, delPattern, getOrSet, incr };
