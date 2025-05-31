import { Loader } from '../interfaces/general';
import { requestIdMiddleware } from '../middleware/requestId';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';

const logger = pino();

export const loadMiddlewares: Loader = (app, context) => {
  // Enable CORS
  app.use(cors());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  app.use(requestIdMiddleware);

  app.use((req: Request & { id?: string }, res: Response, next: NextFunction) => {
    logger.info({
      msg: 'Incoming request',
      id: req.id ?? 'undefined-request-id',
      method: req.method,
      url: req.url,
      body: req.body, // Log request body
      headers: req.headers, // Log headers
    });
    next();
  });
};
