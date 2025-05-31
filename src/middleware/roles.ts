import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const roles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};
