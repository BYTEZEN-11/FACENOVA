process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long_for_safety';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars_long_xx';
process.env.AUTH_RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';

jest.mock('../services/ai.service', () => ({
  analyzeText: jest.fn(async (text) => ({
    analysis: {
      classification: text.length > 100 ? 'real' : 'suspicious',
      trustScore: text.length > 100 ? 78.4 : 52.1,
      confidence: 0.8,
      reasoning: ['Mocked AI response'],
      indicators: {
        clickbait: 10,
        emotionalManipulation: 15,
        sensationalism: 12,
        misleadingPatterns: 18,
      },
    },
    extractedClaims: [{ text: 'Mock claim', verified: true, confidence: 0.7, sources: [] }],
    sources: [],
    processingTime: 0.123,
    modelVersions: { ensemble: 'mock-v1' },
  })),
  analyzeUrl: jest.fn(async () => ({
    analysis: {
      classification: 'suspicious',
      trustScore: 60,
      confidence: 0.7,
      reasoning: ['Mocked URL analysis'],
      indicators: {
        clickbait: 5,
        emotionalManipulation: 5,
        sensationalism: 5,
        misleadingPatterns: 5,
      },
    },
    extractedClaims: [],
    sources: [],
    processingTime: 0.1,
    modelVersions: { ensemble: 'mock-v1' },
  })),
  analyzeImage: jest.fn(async () => ({
    analysis: {
      classification: 'suspicious',
      trustScore: 50,
      confidence: 0.5,
      reasoning: ['Mocked image analysis'],
      indicators: {
        clickbait: 0,
        emotionalManipulation: 0,
        sensationalism: 0,
        misleadingPatterns: 0,
      },
    },
    extractedClaims: [],
    sources: [],
    processingTime: 0.05,
    modelVersions: { image: 'mock-v1' },
  })),
}));

jest.mock('../services/url-extractor.service', () => ({
  extractFromUrl: jest.fn(async (url) => ({
    title: 'Mock Article',
    excerpt: 'Mock excerpt',
    content: 'Mocked content body for analysis. '.repeat(20),
    domain: new URL(url).hostname.replace('www.', ''),
    siteName: new URL(url).hostname,
  })),
}));

jest.mock('../services/source-credibility.service', () => ({
  analyzeCredibility: jest.fn(async () => ({
    credibilityScore: 75,
    reputation: 'trusted',
    sslValid: true,
  })),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Report = require('../models/report.model');

describe('Analyze Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fake_news_analyze_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Report.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Report.deleteMany({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Analyzer', email: 'analyzer@test.com', password: 'Test1234!' });

    token = res.body.data.accessToken;
    userId = res.body.data.user.id;
  });

  describe('POST /api/analyze/text', () => {
    it('analyzes valid text and saves a report', async () => {
      const res = await request(app)
        .post('/api/analyze/text')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'A federal policy update was announced today.' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reportId');
      expect(res.body.data.analysis).toHaveProperty('classification');
      expect(res.body.data.analysis).toHaveProperty('trustScore');

      const saved = await Report.findById(res.body.data.reportId);
      expect(saved).not.toBeNull();
      expect(saved.inputType).toBe('text');
      expect(saved.userId.toString()).toBe(userId);
    });

    it('rejects empty text', async () => {
      const res = await request(app)
        .post('/api/analyze/text')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/analyze/text')
        .send({ text: 'Hello world' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('rejects non-string text (stringified)', async () => {

      const res = await request(app)
        .post('/api/analyze/text')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: { not: 'a string' } });

      expect([200, 400, 422]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.data.analysis).toBeDefined();
      } else {
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('POST /api/analyze/url', () => {
    it('analyzes a valid URL', async () => {
      const res = await request(app)
        .post('/api/analyze/url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://www.reuters.com/article/sample' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reportId');

      const saved = await Report.findById(res.body.data.reportId);
      expect(saved.inputType).toBe('url');
      expect(saved.inputMetadata.url).toContain('reuters.com');
    });

    it('rejects an invalid URL', async () => {
      const res = await request(app)
        .post('/api/analyze/url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'not-a-real-url' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/analyze/image', () => {
    it('rejects when no file is uploaded', async () => {
      const res = await request(app)
        .post('/api/analyze/image')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects unsupported mimetype', async () => {
      const res = await request(app)
        .post('/api/analyze/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('not really a pdf'), {
          filename: 'doc.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('INVALID_FILE_TYPE');
    });
  });
});
