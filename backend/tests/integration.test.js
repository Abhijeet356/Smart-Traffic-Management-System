const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Location = require('../src/models/Location');
const TrafficData = require('../src/models/TrafficData');
const Incident = require('../src/models/Incident');
const Alert = require('../src/models/Alert');
const { ROLES } = require('../src/config/constants');

jest.mock('../src/models/User');
jest.mock('../src/models/Location');
jest.mock('../src/models/TrafficData');
jest.mock('../src/models/Incident');
jest.mock('../src/models/Alert');
jest.mock('../src/models/TrafficSignal');
jest.mock('../src/models/SignalPlan');
jest.mock('../src/models/SystemSettings');

describe('Phase 8: End-to-End System Integration Flow Test', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'smart_traffic_super_secret_jwt_key_academic_project_2026';

  const policeUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Inspector Rajesh Sharma',
    email: 'officer.sharma@traffic.gov',
    role: ROLES.POLICE,
    badgeNumber: 'TP-DELHI-809',
    isActive: true,
  };

  const policeToken = jwt.sign({ id: policeUser._id, role: policeUser.role }, JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(policeUser),
    });
  });

  it('Step 1: Ingest sensor telemetry and verify density analysis', async () => {
    Location.findById.mockResolvedValue({
      _id: 'loc_aiims',
      name: 'AIIMS Ring Road Intersection',
      roadCapacity: 1000,
      speedLimit: 60,
    });

    TrafficData.create.mockResolvedValue({
      _id: 'td_001',
      locationId: 'loc_aiims',
      vehicleCount: 850,
      averageSpeed: 12,
      densityPercentage: 85,
      congestionLevel: 'severe',
    });

    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockResolvedValue({ _id: 'alert_001' });
    User.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

    const res = await request(app)
      .post('/api/traffic/telemetry')
      .set('Authorization', `Bearer ${policeToken}`)
      .send({
        locationId: 'loc_aiims',
        vehicleCount: 850,
        averageSpeed: 12,
        source: 'sensor_sim',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.densityPercentage).toBe(85);
    expect(res.body.data.congestionLevel).toBe('severe');
  });

  it('Step 2: Submit traffic incident and verify auto-generated alert', async () => {
    Location.findById.mockResolvedValue({
      _id: 'loc_aiims',
      name: 'AIIMS Ring Road Intersection',
    });

    Incident.create.mockResolvedValue({
      _id: 'inc_999',
      locationId: 'loc_aiims',
      type: 'accident',
      severity: 'critical',
      description: 'Multiple vehicle pileup on northbound lane',
      status: 'reported',
    });

    Alert.findOne.mockResolvedValue(null);
    Alert.create.mockResolvedValue({
      _id: 'alert_999',
      title: 'Incident: ACCIDENT at AIIMS Ring Road Intersection',
      severity: 'danger',
    });
    User.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${policeToken}`)
      .send({
        locationId: 'loc_aiims',
        type: 'accident',
        severity: 'critical',
        description: 'Multiple vehicle pileup on northbound lane',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.incident.type).toBe('accident');
  });

  it('Step 3: Police acknowledges and marks alert as resolved', async () => {
    const mockAlert = {
      _id: 'alert_999',
      status: 'new',
      save: jest.fn().mockResolvedValue(true),
    };
    Alert.findById.mockResolvedValue(mockAlert);

    const ackRes = await request(app)
      .put('/api/alerts/alert_999/ack')
      .set('Authorization', `Bearer ${policeToken}`);

    expect(ackRes.statusCode).toBe(200);
    expect(ackRes.body.alert.status).toBe('acknowledged');

    const resolveRes = await request(app)
      .put('/api/alerts/alert_999/resolve')
      .set('Authorization', `Bearer ${policeToken}`);

    expect(resolveRes.statusCode).toBe(200);
    expect(resolveRes.body.alert.status).toBe('resolved');
  });
});
