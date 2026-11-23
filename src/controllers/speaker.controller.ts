
import { Request, Response, NextFunction } from "express";
import {
  createSpeaker,
  getEventSpeakers,
  updateSpeaker,
  deleteSpeaker,
} from "../services/speaker.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const speakerController = {
  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEventSpeakers(
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
      const result = await createSpeaker(
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
      const result = await updateSpeaker(
        req.params.speakerId as string,
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
      await deleteSpeaker(
        req.params.speakerId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
