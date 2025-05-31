import request from 'supertest';
import { loadApp } from '../loaders/app';
import { User, UserRole } from '../models/user.model';

let app: any;
let adminToken: string;
let adminId: number;
let userToken: string;
let userId: number;

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
}, 30000);

describe('CV API', () => {
  it('should get CV for a valid user', async () => {
    const res = await request(app)
      .get(`/api/user/${userId}/cv`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('firstName');
    expect(res.body).toHaveProperty('lastName');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('image');
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('experiences');
    expect(res.body).toHaveProperty('projects');
    expect(res.body).toHaveProperty('feedbacks');
  });

  it('should return 404 for non-existent user', async () => {
    const nonExistentUserId = 999999;
    const res = await request(app)
      .get(`/api/user/${nonExistentUserId}/cv`);
    
    expect(res.statusCode).toBe(404);
  });

  it('should include experiences in CV response', async () => {
    const experienceRes = await request(app)
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
    expect(experienceRes.statusCode).toBe(201);

    const cvRes = await request(app)
      .get(`/api/user/${userId}/cv`);
    
    expect(cvRes.statusCode).toBe(200);
    expect(Array.isArray(cvRes.body.experiences)).toBe(true);
    expect(cvRes.body.experiences.length).toBeGreaterThan(0);
    expect(cvRes.body.experiences[0]).toHaveProperty('companyName', 'Test Company');
  });

  it('should include projects in CV response', async () => {

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .field('userId', userId.toString())
      .field('name', 'Test Project')
      .field('startDate', '2024-01-01')
      .field('description', 'Test Project Description');
    expect(projectRes.statusCode).toBe(201);

    const cvRes = await request(app)
      .get(`/api/user/${userId}/cv`);
    
    expect(cvRes.statusCode).toBe(200);
    expect(Array.isArray(cvRes.body.projects)).toBe(true);
    expect(cvRes.body.projects.length).toBeGreaterThan(0);
    expect(cvRes.body.projects[0]).toHaveProperty('description', 'Test Project Description');
  });

  it('should include feedbacks in CV response', async () => {
    const feedbackRes = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fromUser: adminId,
        toUser: userId,
        companyName: 'Test Company',
        context: 'Great work!'
      });
    expect(feedbackRes.statusCode).toBe(201);

    const cvRes = await request(app)
      .get(`/api/user/${userId}/cv`);
    
    expect(cvRes.statusCode).toBe(200);
    expect(Array.isArray(cvRes.body.feedbacks)).toBe(true);
    expect(cvRes.body.feedbacks.length).toBeGreaterThan(0);
    expect(cvRes.body.feedbacks[0]).toHaveProperty('context', 'Great work!');
  });
});
