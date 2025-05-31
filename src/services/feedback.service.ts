import { Feedback } from '../models/feedback.model';
import { cacheService } from './cache.service';

export class FeedbackService {
  async create(data: any, currentUser: any) {
  const required = ['fromUser', 'toUser', 'companyName', 'context'];
  for (const field of required) {
    if (!data[field]) {
      const err: any = new Error(`Validation failed: ${field} is required`);
      err.status = 400;
      throw err;
    }
  }
  // User cannot leave feedback for himself
  if (data.fromUser === data.toUser) {
    const err: any = new Error('You cannot leave feedback for yourself');
    err.status = 400;
    throw err;
  }
  // User cannot leave feedback on behalf of another user (unless Admin)
  if (currentUser.role !== 'Admin' && data.fromUser !== currentUser.id) {
    const err: any = new Error('You cannot leave feedback on behalf of another user');
    err.status = 403;
    throw err;
  }
  const feedback = await Feedback.create(data);

  // Invalidate CV cache for the recipient
  await cacheService.del(`cv:${feedback.toUser}`);

  return feedback;
}

  async list(query: any) {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.page) || 1;
    const offset = (page - 1) * pageSize;
    const { rows, count } = await Feedback.findAndCountAll({
      limit: pageSize,
      offset,
      order: [['id', 'ASC']],
    });
    return { feedbacks: rows, total: count };
  }

  async getById(id: string) {
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      const err: any = new Error('Feedback not found');
      err.status = 404;
      throw err;
    }
    return feedback;
  }

  async update(id: string, data: any, currentUser: any) {
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      const err: any = new Error('Feedback not found');
      err.status = 404;
      throw err;
    }
    if (currentUser.role !== 'Admin' && feedback.fromUser !== currentUser.id) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    // Prevent changing fromUser or toUser to self
    if (data.fromUser && data.fromUser !== feedback.fromUser) {
      throw new Error('Cannot change feedback author');
    }
    if (data.toUser && (data.toUser === feedback.fromUser || data.toUser === data.fromUser)) {
      throw new Error('You cannot leave feedback for yourself');
    }
    Object.assign(feedback, data);
    await feedback.save();

    // Invalidate CV cache for the recipient
    await cacheService.del(`cv:${feedback.toUser}`);

    return feedback;
  }

  async delete(id: string, currentUser: any) {
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      const err: any = new Error('Feedback not found');
      err.status = 404;
      throw err;
    }
    if (currentUser.role !== 'Admin' && feedback.fromUser !== currentUser.id) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    const toUser = feedback.toUser;
    await feedback.destroy();

    // Invalidate CV cache for the recipient
    await cacheService.del(`cv:${toUser}`);
  }
}