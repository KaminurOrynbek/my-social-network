import request from 'supertest';
import { loadApp } from '../loaders/app';
import { User, UserRole } from '../models/user.model';

let app: any;
let adminToken: string;
let adminId: number;
let userToken: string;
let userId: number;
let otherToken: string;
let otherId: number;
let createdFeedbackId: number;

beforeAll(async () => {
  app = await loadApp();

  const adminEmail = `admin${Date.now()}_${Math.floor(Math.random() * 10000)}@gmail.com`;
  const adminPassword = 'admin123';
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Admin',
      lastName: 'User',
      title: 'Admin',
      summary: 'Admin user',
      email: adminEmail,
      password: adminPassword,
    });
  adminId = adminRes.body.id;
  await User.update({ role: UserRole.Admin }, { where: { id: adminId } });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  adminToken = adminLogin.body.token;

  const userEmail = `user${Date.now()}_${Math.floor(Math.random() * 10000)}@gmail.com`;
  const userPassword = 'user1234';
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Regular',
      lastName: 'User',
      title: 'User',
      summary: 'Regular user',
      email: userEmail,
      password: userPassword,
    });
  userId = userRes.body.id;
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: userEmail, password: userPassword });
  userToken = userLogin.body.token;

  // Create another user for feedback recipient
  const otherEmail = `other${Date.now()}_${Math.floor(Math.random() * 10000)}@gmail.com`;
  const otherPassword = 'other123';
  const otherRes = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Other',
      lastName: 'User',
      title: 'User',
      summary: 'Other user',
      email: otherEmail,
      password: otherPassword,
    });
  otherId = otherRes.body.id;
  const otherLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: otherEmail, password: otherPassword });
  otherToken = otherLogin.body.token;
}, 30000);

describe('Feedback API', () => {
  it('should allow user to create feedback for another user', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromUser: userId,
        toUser: otherId,
        companyName: 'Test Company',
        context: 'Great teamwork!'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdFeedbackId = res.body.id;
  });

  it('should not allow user to create feedback for themselves', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromUser: userId,
        toUser: userId,
        companyName: 'Test Company',
        context: 'Self feedback'
      });
    expect(res.statusCode).toBe(400);
  });

  it('should not allow user to create feedback on behalf of another user', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromUser: otherId,
        toUser: userId,
        companyName: 'Test Company',
        context: 'Impersonation'
      });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to create feedback for any user', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fromUser: adminId,
        toUser: userId,
        companyName: 'Admin Company',
        context: 'Admin feedback'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should allow admin to list all feedbacks', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow anyone to get feedback by id', async () => {
    const res = await request(app)
      .get(`/api/feedback/${createdFeedbackId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdFeedbackId);
  });

  it('should allow owner to update their feedback', async () => {
    const res = await request(app)
      .put(`/api/feedback/${createdFeedbackId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        companyName: 'Updated Company',
        context: 'Updated feedback'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('companyName', 'Updated Company');
  });

  it('should not allow non-owner, non-admin to update feedback', async () => {
    const res = await request(app)
      .put(`/api/feedback/${createdFeedbackId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        companyName: 'Should Not Update',
        context: 'Should not update'
      });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete any feedback', async () => {
    const res = await request(app)
      .delete(`/api/feedback/${createdFeedbackId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});