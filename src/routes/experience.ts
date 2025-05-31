import { Router } from 'express';
import { ExperienceController } from '../controller/ExperienceController';
import { authenticate } from '../middleware/authenticate';
import { roles } from '../middleware/roles';
import { UserRole } from '../models/user.model';
import {
  validateExperienceCreate,
  validateExperienceIdParam,
  handleValidation,
  validateUserListQuery
} from '../middleware/validators';

const router = Router();
const controller = new ExperienceController();

router.post(
  '/',
  authenticate,
  roles([UserRole.Admin, UserRole.User]),
  validateExperienceCreate,
  handleValidation,
  controller.create
);

router.get(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  validateUserListQuery,
  handleValidation,
  controller.list
);

router.get(
  '/:id',
  validateExperienceIdParam,
  handleValidation,
  controller.getById
);

router.put(
  '/:id',
  authenticate,
  validateExperienceIdParam,
  handleValidation,
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  validateExperienceIdParam,
  handleValidation,
  controller.delete
);

export default router;