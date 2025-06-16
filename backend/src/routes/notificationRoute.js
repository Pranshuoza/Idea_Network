import express from 'express';
import { createNotification, deleteNotification, getNotifications, markNotificationAsRead } from '../controllers/notificationController.js';
const notificationRouter = express.Router();

notificationRouter.get('/:userId', getNotifications);
notificationRouter.post('/:userId', createNotification);
notificationRouter.put('/:notificationId', markNotificationAsRead);
notificationRouter.delete('/:notificationId', deleteNotification);

export default notificationRouter;