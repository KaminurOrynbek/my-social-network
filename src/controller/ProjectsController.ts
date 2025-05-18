import { Request, Response } from 'express'
import { ProjectsService } from '../services/projects.service'

export class ProjectsController {
  private service = new ProjectsService()

  create = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user
      const project = await this.service.create(req.body, req.file, currentUser)
      res.status(201).json(project)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  list = async (req: Request, res: Response) => {
    try {
      const { projects, total } = await this.service.list(req.query)
      res.set('X-total-count', total.toString())
      res.json(projects)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  getById = async (req: Request, res: Response) => {
    try {
      const project = await this.service.getById(req.params.id)
      res.json(project)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user
      const project = await this.service.update(req.params.id, req.body, req.file, currentUser)
      res.json(project)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message })
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user
      await this.service.delete(req.params.id, currentUser)
      res.status(204).send()
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message })
    }
  }
}