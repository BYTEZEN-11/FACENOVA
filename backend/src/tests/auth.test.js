process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long_for_safety';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars_long_xx';
process.env.AUTH_RATE_LIMIT_MAX = '10000';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');

describe('Auth Endpoints', () => {
  let testUser;

  beforeAll(async () => {

    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fake_news_test';
    await mongoose.connect(testDbUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    testUser = {
      name: 'Test User',
      email: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`,
      password: 'Test1234!',
    };
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: 'weak' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser).expect(201);
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      token = res.body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      expect(res.body.success).toBe(false);
    });
  });
});
