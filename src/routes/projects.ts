import { Router } from 'express'
import { ProjectsController } from '../controller/ProjectsController'
import { authenticate } from '../middleware/authenticate'
import { roles } from '../middleware/roles'
import { UserRole } from '../models/user.model'
import { upload } from '../middleware/uploadMiddleware'
import {
  validateProjectCreate,
  validateProjectIdParam,
  handleValidation,
  validateUserListQuery
} from '../middleware/validators'

const router = Router()
const controller = new ProjectsController()

// Admin, User: Create project (with image)
router.post(
  '/',
  authenticate,
  roles([UserRole.Admin, UserRole.User]),
  upload.single('image'),
  validateProjectCreate,
  handleValidation,
  controller.create
)

// Admin: List projects
router.get(
  '/',
  authenticate,
  roles([UserRole.Admin]),
  validateUserListQuery,
  handleValidation,
  controller.list
)

// Anyone: Get project by id
router.get(
  '/:id',
  validateProjectIdParam,
  handleValidation,
  controller.getById
)

// Owner or Admin: Update project (with image)
router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  validateProjectIdParam,
  handleValidation,
  controller.update
)

// Owner or Admin: Delete project
router.delete(
  '/:id',
  authenticate,
  validateProjectIdParam,
  handleValidation,
  controller.delete
)

export default router