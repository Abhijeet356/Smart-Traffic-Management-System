const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../src/config/constants');

jest.mock('../src/models/User');

describe('Phase 2: Authentication & Authorization APIs', () => {
  const mockUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Officer Vikram Singh',
    email: 'vikram.singh@traffic.gov',
    password: '$2a$10$hashedpasswordstring',
    role: ROLES.POLICE,
    badgeNumber: 'POL-7788',
    isActive: true,
    comparePassword: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
  };

  const JWT_SECRET = process.env.JWT_SECRET || 'smart_traffic_super_secret_jwt_key_academic_project_2026';
  const validToken = jwt.sign({ id: mockUser._id, role: mockUser.role }, JWT_SECRET, { expiresIn: '1d' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new citizen user and return a JWT', async () => {
      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(1);
      User.create.mockResolvedValue({
        _id: '65f1a2b3c4d5e6f7a8b9c0d2',
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        role: ROLES.CITIZEN,
        badgeNumber: null,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rahul Sharma',
          email: 'rahul@gmail.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'rahul@gmail.com');
      expect(res.body.user).toHaveProperty('role', ROLES.CITIZEN);
    });

    it('should reject registration if email is already taken', async () => {
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Officer Vikram Singh',
          email: mockUser.email,
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail with validation errors for invalid email and short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully authenticate with valid credentials', async () => {
      mockUser.comparePassword.mockResolvedValue(true);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'ValidPassword123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(mockUser.email);
    });

    it('should reject login with incorrect password', async () => {
      mockUser.comparePassword.mockResolvedValue(false);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should reject login for non-existent email', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@nowhere.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    it('should return user profile when valid Bearer token is provided', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_or_corrupt_jwt');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
