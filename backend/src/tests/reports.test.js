process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long_for_safety';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars_long_xx';
process.env.AUTH_RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Report = require('../models/report.model');

describe('Reports Endpoints', () => {
  let token;
  let userId;
  let otherToken;
  let otherUserId;

  const buildReport = (user, overrides = {}) => ({
    userId: user._id,
    inputType: 'text',
    inputContent: 'Sample news content.',
    inputMetadata: {},
    analysis: {
      classification: 'real',
      trustScore: 80,
      confidence: 0.85,
      reasoning: ['Looks credible'],
      indicators: {
        clickbait: 5,
        emotionalManipulation: 5,
        sensationalism: 5,
        misleadingPatterns: 10,
      },
    },
    extractedClaims: [],
    sources: [],
    isPublic: false,
    ...overrides,
  });

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fake_news_reports_test';
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

    const me = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Owner', email: 'owner@test.com', password: 'Test1234!' });
    token = me.body.data.accessToken;
    userId = me.body.data.user.id;

    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'other@test.com', password: 'Test1234!' });
    otherToken = other.body.data.accessToken;
    otherUserId = other.body.data.user.id;
  });

  describe('GET /api/reports', () => {
    it('returns paginated list scoped to the user', async () => {
      const owner = await User.findById(userId);
      const other = await User.findById(otherUserId);

      await Report.create([
        buildReport(owner, { inputContent: 'first' }),
        buildReport(owner, { inputContent: 'second' }),
        buildReport(other, { inputContent: 'third' }),
      ]);

      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('filters by classification', async () => {
      const owner = await User.findById(userId);
      const baseAnalysis = {
        classification: 'real',
        trustScore: 50,
        confidence: 0.7,
        reasoning: [],
        indicators: {
          clickbait: 0,
          emotionalManipulation: 0,
          sensationalism: 0,
          misleadingPatterns: 0,
        },
      };
      await Report.create([
        buildReport(owner, { inputContent: 'r1', analysis: { ...baseAnalysis, classification: 'real' } }),
        buildReport(owner, { inputContent: 'f1', analysis: { ...baseAnalysis, classification: 'fake' } }),
      ]);

      const res = await request(app)
        .get('/api/reports?classification=fake')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(1);
      expect(res.body.data.reports[0].inputContent).toBe('f1');
    });

    it('escapes regex metacharacters in search', async () => {
      const owner = await User.findById(userId);
      await Report.create(buildReport(owner, { inputContent: 'plain content' }));

      const res = await request(app)
        .get('/api/reports?search=' + encodeURIComponent('.*'))
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.reports).toHaveLength(0);
    });

    it('rejects unauthenticated requests', async () => {
      await request(app).get('/api/reports').expect(401);
    });
  });

  describe('GET /api/reports/:id', () => {
    it('returns a single report owned by the user', async () => {
      const owner = await User.findById(userId);
      const report = await Report.create(buildReport(owner));

      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.report._id).toBe(report._id.toString());
    });

    it('rejects access to another user’s report', async () => {
      const other = await User.findById(otherUserId);
      const report = await Report.create(buildReport(other));

      const res = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('returns 400 for malformed id', async () => {
      const res = await request(app)
        .get('/api/reports/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('deletes a report owned by the user', async () => {
      const owner = await User.findById(userId);
      const report = await Report.create(buildReport(owner));

      await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const exists = await Report.findById(report._id);
      expect(exists).toBeNull();
    });

    it('returns 404 when deleting a non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/reports/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/reports/stats', () => {
    it('returns aggregate statistics for the user', async () => {
      const owner = await User.findById(userId);
      const baseAnalysis = {
        classification: 'real',
        trustScore: 50,
        confidence: 0.7,
        reasoning: [],
        indicators: {
          clickbait: 0,
          emotionalManipulation: 0,
          sensationalism: 0,
          misleadingPatterns: 0,
        },
      };
      await Report.create([
        buildReport(owner, { analysis: { ...baseAnalysis, classification: 'real', trustScore: 90 } }),
        buildReport(owner, { analysis: { ...baseAnalysis, classification: 'fake', trustScore: 10 } }),
        buildReport(owner, { analysis: { ...baseAnalysis, classification: 'suspicious', trustScore: 50 } }),
      ]);

      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.totalReports).toBe(3);
      expect(res.body.data.classificationBreakdown.real).toBe(1);
      expect(res.body.data.classificationBreakdown.fake).toBe(1);
      expect(res.body.data.classificationBreakdown.suspicious).toBe(1);
      expect(res.body.data.avgTrustScore).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.dailyTrend)).toBe(true);
    });

    it('returns zeros when there are no reports', async () => {
      const res = await request(app)
        .get('/api/reports/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.totalReports).toBe(0);
      expect(res.body.data.classificationBreakdown).toEqual({ real: 0, fake: 0, suspicious: 0 });
    });
  });
});
