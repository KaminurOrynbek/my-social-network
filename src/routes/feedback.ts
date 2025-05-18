import { Router } from 'express';
import { FeedbackController } from '../controller/FeedbackController';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';

const router = Router();
const controller = new FeedbackController();

// Admin, User: Create feedback
router.post('/', authenticate, roles([UserRole.Admin, UserRole.User]), controller.create);

// Admin: List feedbacks
router.get('/', authenticate, roles([UserRole.Admin]), controller.list);

// Anyone: Get feedback by id
router.get('/:id', controller.getById);

// Owner or Admin: Update feedback
router.put('/:id', authenticate, controller.update);

// Owner or Admin: Delete feedback
router.delete('/:id', authenticate, controller.delete);

export default router;