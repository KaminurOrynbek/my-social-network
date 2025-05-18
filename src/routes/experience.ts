import { Router } from 'express';
import { ExperienceController } from '../controller/ExperienceController';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';

const router = Router();
const controller = new ExperienceController();

router.post('/', authenticate, roles([UserRole.Admin, UserRole.User]), controller.create);
router.get('/', authenticate, roles([UserRole.Admin]), controller.list);
router.get('/:id', controller.getById);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;