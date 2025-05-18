import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import { upload } from '../middleware/uploadMiddleware';
import { UsersController } from '../controller/UsersController';

const router = Router();
const controller = new UsersController();

// Admin: Create user
router.post(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  upload.single('image'),
  controller.createUser
);

// Admin: List users with pagination
router.get(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  controller.listUsers
);

// Anyone: Get user by ID
router.get('/:id', controller.getUserById);

// Owner or Admin: Update user
router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  controller.updateUser
);

// Owner or Admin: Delete user
router.delete(
  '/:id',
  authenticate,
  controller.deleteUser
);


export default router;