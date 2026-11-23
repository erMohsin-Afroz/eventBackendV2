
import { Request, Response, NextFunction } from "express";
import {
  createEvent,
  getEventById,
  getPublishedEvents,
  updateEvent,
  deleteEvent,
} from "../services/event.service.js";

type AuthRequest = Request & {
  user: {
    id: string;
    tenantId: string;
  };
};

export const eventController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createEvent(user.id, user.tenantId, req.body);

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as AuthRequest).user.tenantId;
      const result = await getPublishedEvents(tenantId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as AuthRequest).user.tenantId;
      const eventId = req.params.eventId as string;

      const result = await getEventById(eventId, tenantId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const eventId = req.params.eventId as string;

      const result = await updateEvent(
        eventId,
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const eventId = req.params.eventId as string;

      await deleteEvent(eventId, user.id, user.tenantId);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
