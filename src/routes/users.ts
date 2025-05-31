import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import { upload } from '../middleware/uploadMiddleware';
import { UsersController } from '../controller/UsersController';
import { validateUserCreate, validateUserIdParam, validateUserListQuery, handleValidation } from '../middleware/validators';

const router = Router();
const controller = new UsersController();

// Admin: Create user
router.post(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  upload.single('image'),
  validateUserCreate,
  handleValidation,
  controller.createUser
);

// Admin: List users with pagination
router.get(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  validateUserListQuery,
  handleValidation,
  controller.listUsers
);

// Anyone: Get user by ID
router.get('/:id',
  validateUserIdParam,
  handleValidation, 
  controller.getUserById
);

// Owner or Admin: Update user
router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  validateUserIdParam,
  handleValidation,
  controller.updateUser
);

// Owner or Admin: Delete user
router.delete(
  '/:id',
  authenticate,
  validateUserIdParam,
  handleValidation, 
  controller.deleteUser
);


export default router;