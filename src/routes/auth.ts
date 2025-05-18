import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { authenticate } from '../middleware/authenticate'; // 👈 если ты перенёс authenticate сюда
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import multer from 'multer';

const upload = multer();

const router = Router();
const controller = new AuthController();

router.post('/register', controller.uploadMiddleware, controller.register);
router.post('/login', upload.none(), controller.login);
router.get('/me', authenticate, controller.me);
router.get('/admin-only', authenticate, roles([UserRole.Admin]), controller.adminOnly);

export default router;
