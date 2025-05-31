import { Router } from 'express'
import { CvController } from '../controller/CvController'
import { validateCvUserIdParam, handleValidation } from '../middleware/validators'

const router = Router()
const controller = new CvController()

router.get(
  '/user/:userId/cv',
  validateCvUserIdParam,
  handleValidation,
  controller.getCv
)

export default router