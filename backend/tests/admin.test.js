const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Location = require('../src/models/Location');
const TrafficSignal = require('../src/models/TrafficSignal');
const { ROLES } = require('../src/config/constants');

jest.mock('../src/models/User');
jest.mock('../src/models/Location');
jest.mock('../src/models/TrafficSignal');

describe('Phase 3: Admin & Location Management APIs', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'smart_traffic_super_secret_jwt_key_academic_project_2026';

  const adminUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Admin User',
    email: 'admin@traffic.gov',
    role: ROLES.ADMIN,
    isActive: true,
  };

  const citizenUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d3',
    name: 'Citizen User',
    email: 'citizen@gmail.com',
    role: ROLES.CITIZEN,
    isActive: true,
  };

  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1d' });
  const citizenToken = jwt.sign({ id: citizenUser._id, role: citizenUser.role }, JWT_SECRET, { expiresIn: '1d' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/locations (Public)', () => {
    it('should return all locations to any unauthenticated caller', async () => {
      Location.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: '1', name: 'Connaught Place', code: 'INT-101' },
          { _id: '2', name: 'AIIMS Ring Road', code: 'INT-102' },
        ]),
      });

      const res = await request(app).get('/api/locations');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });
  });

  describe('POST /api/locations (Admin Only)', () => {
    const newLocationPayload = {
      name: 'Lajpat Nagar Crossing',
      code: 'INT-106',
      coordinates: { latitude: 28.5677, longitude: 77.2433 },
      roadCapacity: 700,
      speedLimit: 50,
      roadType: 'intersection',
    };

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/locations')
        .send(newLocationPayload);

      expect(res.statusCode).toBe(401);
    });

    it('should reject Citizen user with 403 Forbidden', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(citizenUser),
      });

      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(newLocationPayload);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Forbidden: Role \[citizen\]/i);
    });

    it('should allow Admin to create a new location and initialize traffic signal', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(adminUser),
      });
      Location.findOne.mockResolvedValue(null); // No duplicate code
      Location.create.mockResolvedValue({
        _id: '65f1a2b3c4d5e6f7a8b9c0d9',
        ...newLocationPayload,
      });
      TrafficSignal.create.mockResolvedValue({
        _id: '65f1a2b3c4d5e6f7a8b9c0e0',
        locationId: '65f1a2b3c4d5e6f7a8b9c0d9',
        intersectionName: newLocationPayload.name,
      });

      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLocationPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.location.code).toBe(newLocationPayload.code);
    });
  });

  describe('GET /api/users (Admin Only)', () => {
    it('should allow Admin to view user registry', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(adminUser),
      });
      User.countDocuments.mockResolvedValue(2);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([adminUser, citizenUser]),
            }),
          }),
        }),
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users.length).toBe(2);
    });

    it('should deny Citizen access to user registry with 403', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(citizenUser),
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
