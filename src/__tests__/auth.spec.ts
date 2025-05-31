import request from 'supertest';
import { loadApp } from '../loaders/app';

let app: any;

beforeAll(async () => {
  app = await loadApp();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const uniqueEmail = `testuser+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          title: 'Tester',
          summary: 'Testing',
          email: uniqueEmail,
          password: 'password123'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should fail if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          title: 'Tester',
          summary: 'Testing',
          password: 'password123'
        });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `testuserlogin+${Date.now()}@example.com`;
      const password = 'password123';
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          title: 'Tester',
          summary: 'Testing',
          email,
          password
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistentuser@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(400);
    });
  });
});