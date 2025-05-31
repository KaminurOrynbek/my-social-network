import { Request, Response, NextFunction } from 'express'
import { logger } from '../libs/logger'

export function errorHandler(err: any, req: Request & { id?: string }, res: Response, next: NextFunction) {
  const status = err.status || 500
  const correlationId = req.id || 'no-request-id'
  logger.error({
    msg: 'Error occurred',
    id: correlationId,
    error: err.message,
    stack: err.stack,
    status,
  })
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    correlationId,
  })
}