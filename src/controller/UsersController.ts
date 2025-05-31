import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { UserRole } from '../models/user.model';

export class UsersController {
  private usersService = new UsersService();

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.createUser(req.body, req.file);
      res.status(201).json(user);
    } catch (err: any) {
      next(err);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { users, total } = await this.usersService.listUsers(req.query);
      res.set('X-total-count', total.toString());
      res.json(users);
    } catch (err: any) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.getUserById(req.params.id);
      res.json(user);
    } catch (err: any) {
      next(err);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const currentUser = (req as any).user;
      if (currentUser.id !== Number(userId) && currentUser.role !== UserRole.Admin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const user = await this.usersService.updateUser(userId, req.body, req.file);
      res.json(user);
    } catch (err: any) {
      next(err);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const currentUser = (req as any).user;
      if (currentUser.id !== Number(userId) && currentUser.role !== UserRole.Admin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await this.usersService.deleteUser(userId);
      res.status(204).send();
    } catch (err: any) {
      next(err);
    }
  };
}