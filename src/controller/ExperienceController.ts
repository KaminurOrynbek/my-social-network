import { Request, Response, NextFunction } from 'express';
import { ExperienceService } from '../services/experience.service';
import { UserRole } from '../models/user.model';

export class ExperienceController {
  private service = new ExperienceService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser || !currentUser.id) {
        const err = new Error('User not authenticated');
        (err as any).status = 401;
        throw err;
      }

      // Check if user is Admin or if they're creating experience for themselves
      if (currentUser.role !== 'Admin' && currentUser.id !== req.body.userId) {
        const err = new Error('You can only create experience for yourself');
        (err as any).status = 403;
        throw err;
      }

      const experience = await this.service.create(req.body);

      const response = {
        id: experience.id,
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description
      };
      
      res.status(201).json(response);
    } catch (err: any) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { experiences, total } = await this.service.list(req.query);
      
      const formattedExperiences = experiences.map(experience => ({
        id: experience.id,
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description
      }));

      res.set('X-total-count', total.toString());
      res.json(formattedExperiences);
    } catch (err: any) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const experience = await this.service.getById(req.params.id);
      
      const response = {
        id: experience.id,
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description
      };
      
      res.status(200).json(response);
    } catch (err: any) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const experience = await this.service.update(req.params.id, req.body, currentUser);
      
      const response = {
        id: experience.id,
        userId: experience.userId,
        companyName: experience.companyName,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.description
      };
      
      res.status(200).json(response);
    } catch (err: any) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      await this.service.delete(req.params.id, currentUser);
      res.status(204).send();
    } catch (err: any) {
      next(err);
    }
  };
}