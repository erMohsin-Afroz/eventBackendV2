
import { Request, Response, NextFunction } from "express";
import {
  submitFeedback,
  getEventFeedback,
} from "../services/feedback.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const feedbackController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await submitFeedback(
        req.params.eventId as string,
        user.id,
        user.tenantId,
        req.body.rating,
        req.body.comments,
      );

      res.status(201).json({
        success: true,
        message: "Feedback submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventFeedback(
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
