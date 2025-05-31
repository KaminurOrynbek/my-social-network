import request from 'supertest';
import { loadApp } from '../loaders/app';
import { User, UserRole } from '../models/user.model';

let app: any;
let adminToken: string;
let adminId: number;
let userToken: string;
let userId: number;
let createdProjectId: number;

beforeAll(async () => {
  app = await loadApp();

  // Create admin
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

  // Create regular user
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

describe('Projects API', () => {
  it('should allow user to create a project for themselves', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .field('userId', userId.toString())
      .field('name', 'Test Project')
      .field('startDate', '2024-01-01')
      .field('description', 'My first project');
    console.log('Create project response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdProjectId = res.body.id;
  });

  it('should not allow user to create a project for another user', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .field('userId', adminId.toString())
      .field('name', 'Should Not Work')
      .field('startDate', '2024-01-01')
      .field('description', 'Should not work');
    console.log('Create project for another user response:', res.body);
    expect(res.statusCode).toBe(403); 
  });

  it('should allow admin to create a project for any user', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('userId', userId.toString())
      .field('name', 'Admin Created Project')
      .field('startDate', '2024-01-01')
      .field('description', 'Admin created project');
    console.log('Admin create project response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should allow admin to list all projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Admin list projects response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow anyone to get a project by id', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`);
    console.log('Get project by id response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdProjectId);
  });

  it('should allow owner to update their project', async () => {
    const res = await request(app)
      .put(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', 'Updated Project')
      .field('startDate', '2024-01-01')
      .field('description', 'Updated project');
    console.log('Owner update project response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('description', 'Updated project');
  });

  it('should not allow non-owner, non-admin to update project', async () => {
    // Create another user
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
      .put(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .field('name', 'Should Not Update')
      .field('startDate', '2024-01-01')
      .field('description', 'Should not update');
    console.log('Non-owner update project response:', res.body);
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete any project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Admin delete project response:', res.body);
    expect(res.statusCode).toBe(204);
  });
});