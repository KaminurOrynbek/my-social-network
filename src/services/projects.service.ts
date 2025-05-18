import { Project } from '../models/project.model'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export class ProjectsService {
  async create(data: any, file?: Express.Multer.File, currentUser?: any) {
    const required = ['userId', 'description']
    for (const field of required) {
      if (!data[field]) throw new Error(`Validation failed: ${field} is required`)
    }
    // Only Admin or the user himself can create for userId
    if (currentUser.role !== 'Admin' && Number(data.userId) !== currentUser.id) {
      throw new Error('You cannot create a project for another user')
    }
    let imagePath = '/uploads/default-project.png'
    if (file) {
      const ext = path.extname(file.originalname)
      const filename = `${uuidv4()}${ext}`
      const uploadDir = path.join(__dirname, '../../public/uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const dest = path.join(uploadDir, filename)
      fs.renameSync(file.path, dest)
      imagePath = `/uploads/${filename}`
    }
    const project = await Project.create({
      userId: data.userId,
      image: imagePath,
      description: data.description,
    })
    return project
  }

  async list(query: any) {
    const pageSize = Number(query.pageSize) || 10
    const page = Number(query.page) || 1
    const offset = (page - 1) * pageSize
    const { rows, count } = await Project.findAndCountAll({
      limit: pageSize,
      offset,
      order: [['id', 'ASC']],
    })
    return { projects: rows, total: count }
  }

  async getById(id: string) {
    const project = await Project.findByPk(id)
    if (!project) {
      const err: any = new Error('Project not found')
      err.status = 404
      throw err
    }
    return project
  }

  async update(id: string, data: any, file: Express.Multer.File | undefined, currentUser: any) {
    const project = await Project.findByPk(id)
    if (!project) {
      const err: any = new Error('Project not found')
      err.status = 404
      throw err
    }
    if (currentUser.role !== 'Admin' && project.userId !== currentUser.id) {
      const err: any = new Error('Forbidden')
      err.status = 403
      throw err
    }
    if (file) {
      const ext = path.extname(file.originalname)
      const filename = `${uuidv4()}${ext}`
      const uploadDir = path.join(__dirname, '../../public/uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const dest = path.join(uploadDir, filename)
      fs.renameSync(file.path, dest)
      project.image = `/uploads/${filename}`
    }
    if (data.description !== undefined) project.description = data.description
    await project.save()
    return project
  }

  async delete(id: string, currentUser: any) {
    const project = await Project.findByPk(id)
    if (!project) {
      const err: any = new Error('Project not found')
      err.status = 404
      throw err
    }
    if (currentUser.role !== 'Admin' && project.userId !== currentUser.id) {
      const err: any = new Error('Forbidden')
      err.status = 403
      throw err
    }
    await project.destroy()
  }
}