
import { Request, Response, NextFunction } from "express";
import {
  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../services/notification.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const notificationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createNotification(
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.query.eventId as string | undefined;
      const result = await getNotifications(eventId);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await updateNotification(
        req.params.notificationId as string,
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      await deleteNotification(
        req.params.notificationId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
