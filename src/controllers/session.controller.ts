
import { Request, Response, NextFunction } from "express";
import {
  createSession,
  getEventSessions,
  updateSession,
  deleteSession,
  toggleSessionFavorite,
} from "../services/session.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const sessionController = {
  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEventSessions(
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
      const result = await createSession(
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
      const result = await updateSession(
        req.params.sessionId as string,
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
      await deleteSession(
        req.params.sessionId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await toggleSessionFavorite(
        req.params.sessionId as string,
        req.body.isFavorite,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
