import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import multer from 'multer';
import {
  validateRegister,
  validateLogin,
  handleValidation
} from '../middleware/validators';

const upload = multer();
const router = Router();
const controller = new AuthController();

router.post(
  '/register',
  upload.none(),
  validateRegister,
  handleValidation,
  controller.register
);

router.post(
  '/login',
  upload.none(),
  validateLogin,
  handleValidation,
  controller.login
);

router.get('/me', authenticate, controller.me);
router.get('/admin-only', authenticate, roles([UserRole.Admin]), controller.adminOnly);

export default router;