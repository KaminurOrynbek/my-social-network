import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

// Экспорт готового middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    req.user = user;
    return next();
  })(req, res, next);
};
