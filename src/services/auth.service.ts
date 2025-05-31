import { User, UserRole } from '../models/user.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface RegisterInput {
  firstName: string;
  lastName: string;
  title: string;
  summary: string;
  email: string;
  password: string;
  file?: Express.Multer.File; 
  role?: UserRole;
}
interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterInput) {
    const { firstName, lastName, title, summary, email, password, file } = data;

    if (!firstName || !lastName || !title || !summary || !email || !password) {
      const err: any = new Error('Validation failed: all fields are required');
      err.status = 400;
      throw err;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const err: any = new Error('Email already in use');
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath = '';
    if (file) {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      const uploadDir = path.resolve(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, uniqueFilename);
      fs.renameSync(file.path, fullPath);
      imagePath = `/uploads/${uniqueFilename}`;
    } else {
      imagePath = '/uploads/default-avatar.png';
    }

    // 👇 Жёстко задаем роль, не берём от клиента!
    const role: UserRole = UserRole.User;

    const user = await User.create({
      firstName,
      lastName,
      title,
      summary,
      email,
      password: hashedPassword,
      role,
      image: imagePath,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      summary: user.summary,
      email: user.email,
      image: user.image,
    };
  }

  generateToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    if (!email || !password) {
      const err: any = new Error('Validation failed: email and password are required');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err: any = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const err: any = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        summary: user.summary,
        email: user.email,
        image: user.image,
      },
      token,
    };
  }
}