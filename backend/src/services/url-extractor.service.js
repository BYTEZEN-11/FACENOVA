const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { sanitizeUrl, truncate } = require('../utils/sanitize');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/error.middleware');
const { TIMEOUTS, SSRF } = require('../config/constants');

const FETCH_TIMEOUT = TIMEOUTS.URL_FETCH_MS;
const MAX_CONTENT_LENGTH = TIMEOUTS.URL_MAX_CONTENT_BYTES;

const BLOCKED_HOSTS = SSRF.BLOCKED_HOSTS;

function isPrivateIpv4(host) {

  const parts = host.split('.').map((p) => parseInt(p, 10));
  if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
    if (a >= 224) return true; 
    return false;
  }
  return false;
}

function isPrivateIpv6(host) {

  const lower = host.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fe80:')) return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; 
  if (lower.startsWith('::ffff:')) {

    const v4 = lower.slice(7);
    return isPrivateIpv4(v4);
  }
  return false;
}

function isPrivateIp(host) {
  if (!host) return true;
  if (net.isIP(host) === 4) return isPrivateIpv4(host);
  if (net.isIP(host) === 6) return isPrivateIpv6(host);
  return false; 
}

async function resolveAndValidate(host) {

  if (net.isIP(host)) {
    if (isPrivateIp(host)) {
      throw new ApiError(400, 'BLOCKED_URL', 'URL not allowed: Private IP address');
    }
    return host;
  }

  if (BLOCKED_HOSTS.has(host.toLowerCase())) {
    throw new ApiError(400, 'BLOCKED_URL', 'URL not allowed: Blocked host');
  }

  let addresses;
  try {
    addresses = await dns.lookup(host, { all: true });
  } catch (err) {
    throw new ApiError(400, 'DNS_LOOKUP_FAILED', `Could not resolve hostname: ${host}`);
  }

  for (const { address } of addresses) {
    if (isPrivateIp(address)) {

      logger.warn(`SSRF blocked: ${host} resolved to private IP ${address}`);
      throw new ApiError(
        400,
        'BLOCKED_URL',
        'URL not allowed: hostname resolves to a private or reserved address'
      );
  }
  }

  return addresses[0].address;
}

async function extractFromUrl(url) {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    throw new ApiError(400, 'INVALID_URL', 'Invalid URL provided');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(sanitized);
  } catch {
    throw new ApiError(400, 'INVALID_URL', 'Invalid URL format');
  }

  const pinnedIp = await resolveAndValidate(parsedUrl.hostname);

  const domain = parsedUrl.hostname.replace(/^www\./, '');

  try {

    const response = await axios.get(sanitized, {
      timeout: FETCH_TIMEOUT,
      maxContentLength: MAX_CONTENT_LENGTH,
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FakeNewsBot/1.0; +https://example.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.5',

        'Host': parsedUrl.hostname,
      },
      lookup: (hostname, options, cb) => {

        cb(null, pinnedIp, 4);
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const html = response.data;
    if (typeof html !== 'string' || html.length === 0) {
      throw new ApiError(422, 'EXTRACTION_FAILED', 'Could not extract content from URL');
    }

    const dom = new JSDOM(html, { url: sanitized });
    const document = dom.window.document;

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {

      return fallbackExtraction(document, sanitized, domain);
    }

    return {
      title: article.title || '',
      content: truncate(
        article.textContent || article.content,
        SSRF.ARTICLE_CONTENT_MAX_LEN
      ),

      excerpt: buildExcerpt(
        article.excerpt || article.textContent || '',
        SSRF.EXCERPT_MAX_LEN
      ),
      domain,
      author: article.byline || extractMeta(document, 'author'),
      image: article.leadImage || extractMeta(document, 'og:image'),
      publishedTime: extractMeta(document, 'article:published_time') || extractMeta(document, 'og:published_time'),
      siteName: extractMeta(document, 'og:site_name') || domain,
    };
  } catch (err) {
    if (err.isOperational) throw err;

    if (err.code === 'ECONNABORTED') {
      throw new ApiError(504, 'TIMEOUT', 'URL fetch timed out');
    }
    if (err.response?.status === 404) {
      throw new ApiError(404, 'URL_NOT_FOUND', 'URL returned 404');
    }
    logger.error(`URL extraction failed for ${sanitized}:`, err.message);
    throw new ApiError(502, 'EXTRACTION_FAILED', 'Failed to fetch or parse URL content');
  }
}

function buildExcerpt(text, maxLen = 240) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;

  const window = cleaned.slice(0, maxLen);
  const sentenceEnd = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? ')
  );

  if (sentenceEnd > 40) {
    return window.slice(0, sentenceEnd + 1);
  }

  const lastSpace = window.lastIndexOf(' ');
  if (lastSpace > 40) {
    return window.slice(0, lastSpace) + '…';
  }
  return window + '…';
}

function fallbackExtraction(document, url, domain) {
  const title =
    document.querySelector('title')?.textContent ||
    document.querySelector('h1')?.textContent || '';

  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map(p => p.textContent?.trim() || '')
    .filter(t => t.length > 20);

  const content = paragraphs.join('\n\n');

  return {
    title: title.trim(),
    content: truncate(content, 50000),
    excerpt: buildExcerpt(content, 240),
    domain,
    author: extractMeta(document, 'author'),
    image: extractMeta(document, 'og:image'),
    siteName: domain,
  };
}

function extractMeta(document, name) {
  const selectors = [
    `meta[name="${name}"]`,
    `meta[property="${name}"]`,
    `meta[itemprop="${name}"]`,
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el.getAttribute('content') || '';
    }
  }
  return '';
}

module.exports = { extractFromUrl };
