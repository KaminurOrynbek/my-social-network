import { Request, Response } from 'express';
import { ExperienceService } from '../services/experience.service';
import { UserRole } from '../models/user.model';

export class ExperienceController {
  private service = new ExperienceService();

  create = async (req: Request, res: Response) => {
    try {
      const experience = await this.service.create(req.body);
      res.status(201).json(experience);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const { experiences, total } = await this.service.list(req.query);
      res.set('X-total-count', total.toString());
      res.json(experiences);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const experience = await this.service.getById(req.params.id);
      res.json(experience);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user;
      const experience = await this.service.update(req.params.id, req.body, currentUser);
      res.json(experience);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user;
      await this.service.delete(req.params.id, currentUser);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };
}