import { describe, it, expect } from 'vitest';
import { validators } from '../utils/validators';

describe('validators', () => {
  describe('email', () => {
    it('rejects empty input', () => {
      expect(validators.email('')).toBeTruthy();
    });
    it('accepts valid emails', () => {
      expect(validators.email('test@example.com')).toBe('');
    });
    it('rejects invalid emails', () => {
      expect(validators.email('not-an-email')).toBeTruthy();
    });
  });

  describe('password', () => {
    it('requires at least 8 chars', () => {
      expect(validators.password('Ab1!')).toBeTruthy();
    });
    it('requires uppercase, lowercase, number, special', () => {
      expect(validators.password('alllower1!')).toBeTruthy();
      expect(validators.password('ALLUPPER1!')).toBeTruthy();
      expect(validators.password('NoNumber!')).toBeTruthy();
      expect(validators.password('NoSpecial1')).toBeTruthy();
    });
    it('accepts strong passwords', () => {
      expect(validators.password('Strong1Pass!')).toBe('');
    });
  });

  describe('url', () => {
    it('requires non-empty', () => {
      expect(validators.url('')).toBeTruthy();
    });
    it('accepts http/https', () => {
      expect(validators.url('https://example.com')).toBe('');
      expect(validators.url('http://example.com')).toBe('');
    });
    it('rejects other protocols', () => {
      expect(validators.url('ftp://example.com')).toBeTruthy();
    });
    it('rejects garbage', () => {
      expect(validators.url('not-a-url')).toBeTruthy();
    });
  });

  describe('text', () => {
    it('requires minimum length', () => {
      expect(validators.text('short')).toBeTruthy();
    });
    it('rejects too long', () => {
      expect(validators.text('x'.repeat(100), 10, 50)).toBeTruthy();
    });
    it('accepts valid length', () => {
      expect(validators.text('a'.repeat(100), 10, 200)).toBe('');
    });
  });
});
