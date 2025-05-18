import { Request, Response } from 'express';
import { FeedbackService } from '../services/feedback.service';

export class FeedbackController {
  private service = new FeedbackService();

  create = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user;
      const feedback = await this.service.create(req.body, currentUser);
      res.status(201).json(feedback);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const { feedbacks, total } = await this.service.list(req.query);
      res.set('X-total-count', total.toString());
      res.json(feedbacks);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const feedback = await this.service.getById(req.params.id);
      res.json(feedback);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user;
      const feedback = await this.service.update(req.params.id, req.body, currentUser);
      res.json(feedback);
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