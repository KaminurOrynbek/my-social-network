import { Request, Response, NextFunction } from 'express'
import { CvService } from '../services/cv.service'

export class CvController {
  private service = new CvService()

  getCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const cv = await this.service.getCv(userId)
      
      const response = {
        id: cv.id,
        firstName: cv.firstName,
        lastName: cv.lastName,
        title: cv.title,
        image: cv.image,
        summary: cv.summary,
        email: cv.email,
        experiences: cv.experiences.map((exp: any) => ({
          userId: exp.userId,
          companyName: exp.companyName,
          role: exp.role,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description
        })),
        projects: cv.projects.map((proj: any) => ({
          id: proj.id,
          userId: proj.userId,
          image: proj.image,
          description: proj.description
        })),
        feedbacks: cv.feedbacks.map((fb: any) => ({
          id: fb.id,
          fromUser: fb.fromUser,
          companyName: fb.companyName,
          toUser: fb.toUser,
          context: fb.context
        }))
      }
      
      res.json(response)
    } catch (err: any) {
      next(err)
    }
  }
}