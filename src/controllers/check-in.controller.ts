
import { Request, Response, NextFunction } from "express";
import {
  checkInAttendee,
  getEventCheckIns,
} from "../services/check-in.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const checkInController = {
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await checkInAttendee(
        req.params.eventId as string,
        req.body.qrToken,
        user.id,
        user.tenantId,
      );

      res.status(200).json({
        success: true,
        message: "Attendee checked in successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEventCheckIns(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getEventCheckIns(
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
