
import { Request, Response, NextFunction } from "express";
import {
  createSupportInquiry,
  getMySupportInquiries,
  getEventSupportInquiries,
  updateSupportInquiry,
} from "../services/support-inquiry.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const supportInquiryController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;

      const result = await createSupportInquiry(
        user.id,
        user.tenantId,
        {
          ...req.body,
          eventId: req.params.eventId as string,
        },
      );

      res.status(201).json({
        success: true,
        message: "Support inquiry submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getMySupportInquiries(
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventSupportInquiries(
        req.params.eventId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await updateSupportInquiry(
        req.params.inquiryId as string,
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
