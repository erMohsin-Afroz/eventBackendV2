
import { Request, Response, NextFunction } from "express";
import {
  registerForEvent,
  cancelRegistration,
  reviewRegistration,
  getEventRegistrations,
} from "../services/registration.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const registrationController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await registerForEvent(
        req.params.eventId as string,
        user.id,
        user.tenantId,
      );

      res.status(201).json({
        success: true,
        message: "Registration processed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await cancelRegistration(
        req.params.registrationId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await reviewRegistration(
        req.params.registrationId as string,
        user.id,
        user.tenantId,
        req.body.approvalStatus,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getEventRegistrations(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventRegistrations(
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
