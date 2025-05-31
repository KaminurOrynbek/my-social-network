import request from 'supertest';
import { loadApp } from '../loaders/app';
import { User, UserRole } from '../models/user.model';

let app: any;
let adminToken: string;
let adminId: number;
let userToken: string;
let userId: number;
let createdExperienceId: number;

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
});

describe('Experience API', () => {
  it('should allow user to create experience for themselves', async () => {
    const res = await request(app)
      .post('/api/experience')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId,
        companyName: 'Test Company',
        role: 'Developer',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        description: 'Worked on cool stuff'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdExperienceId = res.body.id;
  });

  it('should not allow user to create experience for another user', async () => {
    const res = await request(app)
      .post('/api/experience')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId: adminId,
        companyName: 'Other Company',
        role: 'Manager',
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        description: 'Should not work'
      });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to create experience for any user', async () => {
    const res = await request(app)
      .post('/api/experience')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        companyName: 'Admin Company',
        role: 'Lead',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        description: 'Admin created experience'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should allow admin to list all experiences', async () => {
    const res = await request(app)
      .get('/api/experience')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow anyone to get an experience by id', async () => {
    const res = await request(app)
      .get(`/api/experience/${createdExperienceId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdExperienceId);
  });

  it('should allow owner to update their experience', async () => {
    const res = await request(app)
      .put(`/api/experience/${createdExperienceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        companyName: 'Updated Company',
        role: 'Senior Developer',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        description: 'Updated experience'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('companyName', 'Updated Company');
  });

  it('should not allow non-owner, non-admin to update experience', async () => {
    
    const otherEmail = `other${Date.now()}_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const otherPassword = 'other123';
    await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Other',
        lastName: 'User',
        title: 'User',
        summary: 'Other user',
        email: otherEmail,
        password: otherPassword,
      });
    const otherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: otherEmail, password: otherPassword });
    const otherToken = otherLogin.body.token;

    const res = await request(app)
      .put(`/api/experience/${createdExperienceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        companyName: 'Should Not Update',
        role: 'Intern',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        description: 'Should not update'
      });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete any experience', async () => {
    const res = await request(app)
      .delete(`/api/experience/${createdExperienceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});