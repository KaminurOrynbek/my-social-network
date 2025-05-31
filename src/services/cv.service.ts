import { User } from '../models/user.model'
import { Experience } from '../models/experience.model'
import { Project } from '../models/project.model'
import { Feedback } from '../models/feedback.model'
import { cacheService } from './cache.service'

export class CvService {
  async getCv(userId: string) {
    // Check cache first
    const cacheKey = `cv:${userId}`
    const cachedCv = await cacheService.get(cacheKey)
    if (cachedCv) {
      return JSON.parse(cachedCv)
    }

    // Find user
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'title', 'image', 'summary', 'email'],
    })
    if (!user) {
      const err: any = new Error('User not found')
      err.status = 404
      throw err
    }

    // Get experiences
    const experiences = await Experience.findAll({
      where: { userId },
      attributes: ['userId', 'companyName', 'role', 'startDate', 'endDate', 'description'],
      order: [['startDate', 'DESC']],
    })

    // Get projects
    const projects = await Project.findAll({
      where: { userId },
      attributes: ['id', 'userId', 'image', 'description'],
      order: [['id', 'DESC']],
    })

    // Get feedbacks (where toUser = userId)
    const feedbacks = await Feedback.findAll({
      where: { toUser: userId },
      attributes: ['id', 'fromUser', 'companyName', 'toUser', 'context'],
      order: [['id', 'DESC']],
    })

    const result = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      image: user.image,
      summary: user.summary,
      email: user.email,
      experiences,
      projects,
      feedbacks,
    }

    await cacheService.set(cacheKey, JSON.stringify(result), 600)
    return result
  }
}