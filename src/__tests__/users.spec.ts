import request from 'supertest';
import { loadApp } from '../loaders/app';
import { User, UserRole } from '../models/user.model'; 

let app: any;
let adminToken: string;
let adminId: number;

beforeAll(async () => {
  app = await loadApp();

  const adminEmail = `admin${Date.now()}@gmail.com`;
  const password = 'admin123';

  // Register as a normal user
  const registerRes = await request(app)
  .post('/api/auth/register')
  .send({
    firstName: 'Test',
    lastName: 'Admin',
    title: 'Admin',
    summary: 'Test admin user',
    email: adminEmail,
    password,
  });

console.log('Register response:', registerRes.body); 

adminId = registerRes.body.id; 
if (!adminId) throw new Error('User ID not returned from register endpoint');
  await User.update({ role: UserRole.Admin }, { where: { id: adminId } });

  //login as admin
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminEmail,
      password,
    });
  adminToken = loginRes.body.token;
});

describe('Users API', () => {
  it('should allow admin to list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow admin to get a user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', adminId);
  });

  it('should not allow listing users without auth', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  it('should not allow non-admin to list users', async () => {
    //regular user
    const userEmail = `user${Date.now()}@example.com`;
    const password = 'userpassword123';
    await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        title: 'User',
        summary: 'Test user',
        email: userEmail,
        password,
      });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password,
      });
    const userToken = loginRes.body.token;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});