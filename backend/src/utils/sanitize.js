const sanitizeHtml = require('sanitize-html');

function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
}

function sanitizeRichText(input) {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function truncate(str, max = 5000) {
  if (typeof str !== 'string') return '';
  return str.length > max ? str.substring(0, max) : str;
}

module.exports = {
  sanitizeText,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeEmail,
  truncate,
};
