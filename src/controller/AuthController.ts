import { Request, Response } from 'express';
import multer from 'multer';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const upload = multer({ dest: 'tmp/' });

export class AuthController {
  private authService = new AuthService();

  uploadMiddleware = upload.single('image');

  
register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, title, summary, email, password } = req.body;
    const file = req.file;

    // Здесь роль жёстко задаём как обычного пользователя
    const role = UserRole.User; // Или просто 'user' если нет enum

    const user = await this.authService.register({
      firstName,
      lastName,
      title,
      summary,
      email,
      password,
      file,
      role,
    });

    return res.status(201).json(user);
  } catch (err: any) {
    if (err.message.includes('Validation') || err.message.includes('Email already in use')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes('Invalid credentials')) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  adminOnly = async (req: Request, res: Response) => {
    res.json({ message: 'Welcome, Admin!' });
  };
}
