import { Request, Response } from 'express'
import { CvService } from '../services/cv.service'

export class CvController {
  private service = new CvService()

  getCv = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const cv = await this.service.getCv(userId)
      res.json(cv)
    } catch (err: any) {
      if (err.status === 404) {
        res.status(404).json({ error: err.message })
      } else if (err.message && err.message.includes('Validation')) {
        res.status(400).json({ error: err.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }
}