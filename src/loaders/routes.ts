import express from 'express';
import {Context} from '../interfaces/general';
import authRouter from '../routes/auth'; 
import usersRouter from '../routes/users';
import experienceRouter from '../routes/experience';
import feedbackRouter from '../routes/feedback';
import projectsRouter from '../routes/projects'
import cvRouter from '../routes/cv'


export const loadRoutes = (app: express.Router, context: Context) => {
  app.use('/api/auth', authRouter); 
  app.use('/api/users', usersRouter); 
  app.use('/api/experience', experienceRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api', cvRouter);
}
