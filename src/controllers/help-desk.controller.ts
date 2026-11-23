
import { Request, Response, NextFunction } from "express";
import {
  createHelpDeskContact,
  getPublishedHelpDeskContacts,
  updateHelpDeskContact,
  deleteHelpDeskContact,
} from "../services/help-desk.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const helpDeskController = {
  async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getPublishedHelpDeskContacts(
        req.params.eventId as string,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createHelpDeskContact(
        req.params.eventId as string,
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
      const result = await updateHelpDeskContact(
        req.params.contactId as string,
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
      await deleteHelpDeskContact(
        req.params.contactId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({
        success: true,
        message: "Help desk contact deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
