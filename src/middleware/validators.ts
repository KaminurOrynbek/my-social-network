import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';


//Auth validators
export const validateRegister = [
  body('firstName').isString().isLength({ max: 128 }),
  body('lastName').isString().isLength({ max: 128 }),
  body('title').isString().isLength({ max: 256 }),
  body('summary').isString().isLength({ max: 256 }),
  body('email').isEmail().isLength({ max: 255 }),
  body('password').isString().isLength({ min: 6 }),
];

export const validateLogin = [
  body('email').isEmail().isLength({ max: 255 }),
  body('password').isString().isLength({ min: 6 }),
];

// User validators
export const validateUserCreate = [
  body('firstName').isString().isLength({ max: 128 }),
  body('lastName').isString().isLength({ max: 128 }),
  body('title').isString().isLength({ max: 256 }),
  body('summary').isString().isLength({ max: 256 }),
  body('email').isEmail().isLength({ max: 255 }),
  body('password').isString().isLength({ min: 6 }),
  body('role').isIn(['Admin', 'User']),
];

export const validateUserIdParam = [
  param('id').isInt().toInt(),
];

export const validateUserListQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
];

// Project validators
export const validateProjectCreate = [
  body('name').isString().isLength({ max: 128 }),
  body('description').isString().isLength({ max: 512 }),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('userId').isInt(),
];

export const validateProjectIdParam = [
  param('id').isInt().toInt(),
];

export const validateFeedbackCreate = [
  body('fromUser').isInt(),
  body('toUser').isInt(),
  body('companyName').isString().isLength({ max: 128 }),
  body('context').isString().isLength({ max: 512 }),
];

export const validateFeedbackIdParam = [
  param('id').isInt().toInt(),
];

// Experience validators
export const validateExperienceCreate = [
  body('companyName').isString().isLength({ max: 128 }),
  body('role').isString().isLength({ max: 128 }),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('userId').isInt(),
];

export const validateExperienceIdParam = [
  param('id').isInt().toInt(),
];

// CV validators
export const validateCvUserIdParam = [
  param('userId').isInt().withMessage('userId must be an integer').toInt(),
];

// General validation error handler
export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};