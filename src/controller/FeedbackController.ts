import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';

export class FeedbackController {
  private service = new FeedbackService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const feedback = await this.service.create(req.body, currentUser);

      const response = {
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        context: feedback.context
      };

      res.status(201).json(response);
    } catch (err: any) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { feedbacks, total } = await this.service.list(req.query);

      const formattedFeedbacks = feedbacks.map(feedback => ({
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        context: feedback.context
      }));

      res.set('X-total-count', total.toString());
      res.json(formattedFeedbacks);
    } catch (err: any) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const feedback = await this.service.getById(req.params.id);

      const response = {
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        context: feedback.context
      };

      res.json(response);
    } catch (err: any) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const feedback = await this.service.update(req.params.id, req.body, currentUser);

      const response = {
        id: feedback.id,
        fromUser: feedback.fromUser,
        companyName: feedback.companyName,
        toUser: feedback.toUser,
        context: feedback.context
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