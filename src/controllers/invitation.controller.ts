
import { Request, Response, NextFunction } from "express";
import {
  createInvitations,
  getEventInvitations,
  validateInvitationCode,
} from "../services/invitation.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const invitationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createInvitations(
        req.params.eventId as string,
        user.id,
        user.tenantId,
        req.body.emails,
        req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      );

      res.status(201).json({
        success: true,
        message: "Invitations created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventInvitations(
        req.params.eventId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await validateInvitationCode(req.body.code);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
