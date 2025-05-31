import { Router } from 'express';
import { FeedbackController } from '../controller/FeedbackController';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import {
  validateFeedbackCreate,
  validateFeedbackIdParam,
  handleValidation,
  validateUserListQuery
} from '../middleware/validators';

const router = Router();
const controller = new FeedbackController();

// Admin, User: Create feedback
router.post(
  '/',
  authenticate,
  roles([UserRole.Admin, UserRole.User]),
  validateFeedbackCreate,
  handleValidation,
  controller.create
);

// Admin: List feedbacks
router.get(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  validateUserListQuery,
  handleValidation,
  controller.list
);

// Anyone: Get feedback by id
router.get(
  '/:id',
  validateFeedbackIdParam,
  handleValidation,
  controller.getById
);

// Owner or Admin: Update feedback
router.put(
  '/:id',
  authenticate,
  validateFeedbackIdParam,
  handleValidation,
  controller.update
);

// Owner or Admin: Delete feedback
router.delete(
  '/:id',
  authenticate,
  validateFeedbackIdParam,
  handleValidation,
  controller.delete
);

export default router;