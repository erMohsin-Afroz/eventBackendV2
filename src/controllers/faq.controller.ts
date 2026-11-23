
import { Request, Response, NextFunction } from "express";
import {
  createFaq,
  getPublishedFaqs,
  updateFaq,
  deleteFaq,
} from "../services/faq.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const faqController = {
  async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.query.eventId as string | undefined;
      const result = await getPublishedFaqs(eventId);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const eventId = req.body.eventId
        ? String(req.body.eventId)
        : null;

      const result = await createFaq(
        eventId,
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await updateFaq(
        req.params.faqId as string,
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
      await deleteFaq(
        req.params.faqId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({
        success: true,
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
