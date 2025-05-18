import { Loader } from '../interfaces/general';
import { requestIdMiddleware } from '../middleware/requestId';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const logger = pino();

export const loadMiddlewares: Loader = (app, context) => {
  app.use(requestIdMiddleware);

  app.use((req: Request & { id?: string }, res: Response, next: NextFunction) => {
    logger.info({
      msg: 'Incoming request',
      id: req.id ?? 'undefined-request-id',
      method: req.method,
      url: req.url,
    });
    next();
  });

};
