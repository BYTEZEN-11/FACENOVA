const {
  sanitizeText,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeEmail,
  truncate,
} = require('../utils/sanitize');

describe('sanitize utility', () => {
  describe('sanitizeText', () => {
    it('removes all HTML tags', () => {
      expect(sanitizeText('<p>hello <b>world</b></p>')).toBe('hello world');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('removes script tags entirely', () => {
      const result = sanitizeText('<script>alert("xss")</script>safe');
      expect(result).not.toContain('alert');
      expect(result).toContain('safe');
    });
  });

  describe('sanitizeRichText', () => {
    it('allows safe tags', () => {
      const result = sanitizeRichText('<b>bold</b> <script>x</script>');
      expect(result).toContain('<b>bold</b>');
      expect(result).not.toContain('script');
    });

    it('forces rel on anchor tags', () => {
      const result = sanitizeRichText('<a href="https://example.com">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('sanitizeUrl', () => {
    it('accepts http/https URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBeTruthy();
      expect(sanitizeUrl('https://example.com/path')).toBeTruthy();
    });

    it('rejects non-http protocols', () => {
      expect(sanitizeUrl('ftp://example.com')).toBeNull();
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('rejects malformed URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
    });

    it('returns null for non-strings', () => {
      expect(sanitizeUrl(undefined)).toBeNull();
      expect(sanitizeUrl(123)).toBeNull();
    });
  });

  describe('sanitizeEmail', () => {
    it('lowercases and trims', () => {
      expect(sanitizeEmail('  Foo@Bar.COM  ')).toBe('foo@bar.com');
    });

    it('handles non-strings', () => {
      expect(sanitizeEmail(undefined)).toBe('');
    });
  });

  describe('truncate', () => {
    it('truncates strings longer than max', () => {
      expect(truncate('a'.repeat(100), 10)).toHaveLength(10);
    });

    it('leaves shorter strings unchanged', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('uses default max of 5000', () => {
      const short = 'hello';
      expect(truncate(short)).toBe(short);
    });

    it('returns empty string for non-strings', () => {
      expect(truncate(undefined)).toBe('');
      expect(truncate(123)).toBe('');
    });
  });
});
