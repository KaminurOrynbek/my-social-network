import { Experience } from '../models/experience.model';
import { cacheService } from './cache.service';

export class ExperienceService {
  async create(data: any) {
    try {
      // Convert dates to proper format if they're strings
      const experienceData = { ...data };
      if (typeof experienceData.startDate === 'string') {
        experienceData.startDate = new Date(experienceData.startDate);
      }
      if (typeof experienceData.endDate === 'string') {
        experienceData.endDate = new Date(experienceData.endDate);
      }

      const experience = await Experience.create(experienceData);

      // Invalidate CV cache for the user
      await cacheService.del(`cv:${experience.userId}`);

      return experience;
    } catch (error: any) {
      console.error('Error creating experience:', error);
      throw new Error(`Failed to create experience: ${error.message}`);
    }
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

    // Invalidate CV cache for the user
    await cacheService.del(`cv:${experience.userId}`);

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
    const userId = experience.userId;
    await experience.destroy();

    // Invalidate CV cache for the user
    await cacheService.del(`cv:${userId}`);
  }
}