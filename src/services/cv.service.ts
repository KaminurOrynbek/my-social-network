import { User } from '../models/user.model'
import { Experience } from '../models/experience.model'
import { Project } from '../models/project.model'
import { Feedback } from '../models/feedback.model'

export class CvService {
  async getCv(userId: string) {
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
      attributes: ['id', 'fromUser', 'companyName', 'toUser', 'content'],
      order: [['id', 'DESC']],
    })

    // Map feedbacks to match the required field name "context"
    const feedbacksMapped = feedbacks.map(fb => ({
      id: fb.id,
      fromUser: fb.fromUser,
      companyName: fb.companyName,
      toUser: fb.toUser,
      context: fb.content,
    }))

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      image: user.image,
      summary: user.summary,
      email: user.email,
      experiences,
      projects,
      feedbacks: feedbacksMapped,
    }
  }
}