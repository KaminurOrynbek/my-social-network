import { User, UserRole } from '../models/user.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { cacheService } from './cache.service';

export class UsersService {
  async createUser(data: any, file?: Express.Multer.File) {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'title', 'summary', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!data[field]) {
        const err: any = new Error(`Missing required field: ${field}`);
        err.status = 400;
        throw err;
      }
    }

    // Check for existing email
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      const err: any = new Error('Email already in use');
      err.status = 400;
      throw err;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Handle image upload
    let imagePath = '/uploads/default-avatar.png';
    if (file) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const dest = path.join(uploadDir, filename);
      fs.renameSync(file.path, dest);
      imagePath = `/uploads/${filename}`;
    }

    // Create user
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title,
      summary: data.summary,
      email: data.email,
      password: passwordHash,
      role: data.role,
      image: imagePath,
    });

    // Invalidate user list cache
    await cacheService.delPattern('users:list:*');

    // Return only specified fields
    const userObj = user.toJSON();
    return {
      id: userObj.id,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      title: userObj.title,
      summary: userObj.summary,
      email: userObj.email,
      password: userObj.password,
      role: userObj.role
    };
  }

  async listUsers(query: any) {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.page) || 1;
    const offset = (page - 1) * pageSize;
    const cacheKey = `users:list:page=${page}&pageSize=${pageSize}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      limit: pageSize,
      offset,
      attributes: ['id', 'firstName', 'lastName', 'title', 'summary', 'email', 'role'],
      order: [['id', 'ASC']],
    });

    const result = { users, total };
    await cacheService.set(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async getUserById(id: string) {
    const cacheKey = `users:get:${id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName', 'lastName', 'title', 'summary', 'email', 'password', 'role'],
    });
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    await cacheService.set(cacheKey, JSON.stringify(user), 600);
    return user;
  }

  async updateUser(id: string, data: any, file?: Express.Multer.File) {
    const user = await User.findByPk(id);
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Update fields
    const updatableFields = ['firstName', 'lastName', 'title', 'summary', 'email', 'role'];
    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        (user as any)[field] = data[field];
      }
    }

    // Hash new password if provided
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    // Handle new image upload
    if (file) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const dest = path.join(uploadDir, filename);
      fs.renameSync(file.path, dest);
      user.image = `/uploads/${filename}`;
    }

    await user.save();

    // Invalidate user cache and user list cache
    await cacheService.del(`users:get:${id}`);
    await cacheService.delPattern('users:list:*');
    await cacheService.del(`cv:${id}`);

    // Return only specified fields
    const userObj = user.toJSON();
    return {
      id: userObj.id,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      title: userObj.title,
      summary: userObj.summary,
      email: userObj.email,
      role: userObj.role
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }
    await user.destroy();

    // Invalidate user cache and user list cache
    await cacheService.del(`users:get:${id}`);
    await cacheService.delPattern('users:list:*');
    await cacheService.del(`cv:${id}`);
  }
}