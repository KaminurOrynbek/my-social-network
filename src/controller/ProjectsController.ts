import { Request, Response, NextFunction } from 'express'
import { ProjectsService } from '../services/projects.service'

export class ProjectsController {
  private service = new ProjectsService()

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user
      const project = await this.service.create(req.body, req.file, currentUser)
      
      const response = {
        id: project.id,
        userId: project.userId,
        image: project.image,
        description: project.description
      }
      
      res.status(201).json(response)
    } catch (err: any) {
      next(err)
    }
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projects, total } = await this.service.list(req.query)
      
      const formattedProjects = projects.map(project => ({
        id: project.id,
        userId: project.userId,
        image: project.image,
        description: project.description
      }))
      
      res.set('X-total-count', total.toString())
      res.json(formattedProjects)
    } catch (err: any) {
      next(err)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.service.getById(req.params.id)
      
      const response = {
        id: project.id,
        userId: project.userId,
        image: project.image,
        description: project.description
      }
      
      res.json(response)
    } catch (err: any) {
      next(err)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const project = await this.service.update(req.params.id, req.body, req.file, currentUser);
      
      const response = {
        id: project.id,
        userId: project.userId,
        image: project.image,
        description: project.description
      };
      
      res.status(200).json(response);
    } catch (err: any) {
      next(err)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      await this.service.delete(req.params.id, currentUser);
      res.status(204).send();
    } catch (err: any) {
      next(err)
    }
  }
}