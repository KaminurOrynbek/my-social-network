import { Experience } from '../models/experience.model';

export class ExperienceService {
  async create(data: any) {
    const required = ['userId', 'companyName', 'role', 'startDate', 'endDate', 'description'];
    for (const field of required) {
      if (!data[field]) throw new Error(`Validation failed: ${field} is required`);
    }
    const experience = await Experience.create(data);
    return experience;
  }

  async list(query: any) {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.page) || 1;
    const offset = (page - 1) * pageSize;
    const { rows, count } = await Experience.findAndCountAll({
      limit: pageSize,
      offset,
      order: [['id', 'ASC']],
    });
    return { experiences: rows, total: count };
  }

  async getById(id: string) {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      const err: any = new Error('Experience not found');
      err.status = 404;
      throw err;
    }
    return experience;
  }

  async update(id: string, data: any, currentUser: any) {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      const err: any = new Error('Experience not found');
      err.status = 404;
      throw err;
    }
    if (currentUser.role !== 'Admin' && experience.userId !== currentUser.id) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    Object.assign(experience, data);
    await experience.save();
    return experience;
  }

  async delete(id: string, currentUser: any) {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      const err: any = new Error('Experience not found');
      err.status = 404;
      throw err;
    }
    if (currentUser.role !== 'Admin' && experience.userId !== currentUser.id) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    await experience.destroy();
  }
}