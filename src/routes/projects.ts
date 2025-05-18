import { Router } from 'express'
import { ProjectsController } from '../controller/ProjectsController'
import { authenticate } from '../middleware/authenticate'
import { roles } from '../middleware/roles'
import { UserRole } from '../models/user.model'
import { upload } from '../middleware/uploadMiddleware'

const router = Router()
const controller = new ProjectsController()

// Admin, User: Create project (with image)
router.post('/', authenticate, roles([UserRole.Admin, UserRole.User]), upload.single('image'), controller.create)

// Admin: List projects
router.get('/', authenticate, roles([UserRole.Admin]), controller.list)

// Anyone: Get project by id
router.get('/:id', controller.getById)

// Owner or Admin: Update project (with image)
router.put('/:id', authenticate, upload.single('image'), controller.update)

// Owner or Admin: Delete project
router.delete('/:id', authenticate, controller.delete)

export default router