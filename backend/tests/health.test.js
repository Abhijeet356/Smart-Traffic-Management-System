const request = require('supertest');
const app = require('../src/app');

describe('Healthcheck & Core API Verification', () => {
  it('GET /api/health should return status UP and version metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('system', 'Smart Traffic Management System API');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET / should return welcome payload', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('GET /api/undefined-endpoint should return 404 with structured error', async () => {
    const res = await request(app).get('/api/undefined-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
