import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { UserRole } from '../models/user.model';

export class UsersController {
  private usersService = new UsersService();

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.usersService.createUser(req.body, req.file);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  listUsers = async (req: Request, res: Response) => {
    try {
      const { users, total } = await this.usersService.listUsers(req.query);
      res.set('X-total-count', total.toString());
      res.json(users);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.usersService.getUserById(req.params.id);
      res.json(user);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      // Only owner or admin can update
      const userId = req.params.id;
      const currentUser = (req as any).user;
      if (currentUser.id !== Number(userId) && currentUser.role !== UserRole.Admin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const user = await this.usersService.updateUser(userId, req.body, req.file);
      res.json(user);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      // Only owner or admin can delete
      const userId = req.params.id;
      const currentUser = (req as any).user;
      if (currentUser.id !== Number(userId) && currentUser.role !== UserRole.Admin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await this.usersService.deleteUser(userId);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };
}