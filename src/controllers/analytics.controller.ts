
import { Request, Response, NextFunction } from "express";
import {
  getEventAnalytics,
  getOrganiserDashboard,
} from "../services/analytics.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getOrganiserDashboard(
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getEventAnalytics(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventAnalytics(
        req.params.eventId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
