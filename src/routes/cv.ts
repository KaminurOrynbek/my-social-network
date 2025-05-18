import { Router } from 'express'
import { CvController } from '../controller/CvController'

const router = Router()
const controller = new CvController()

router.get('/user/:userId/cv', controller.getCv)

export default router