import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const upload = multer({ dest: 'tmp/' });

export class AuthController {
  private authService = new AuthService();

  uploadMiddleware = upload.single('image');

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, title, summary, email, password } = req.body;
      const file = req.file;
      const role = UserRole.User;

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
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (err) {
      next(err);
    }
  };

  adminOnly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ message: 'Welcome, Admin!' });
    } catch (err) {
      next(err);
    }
  };
}