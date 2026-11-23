
import { Request, Response, NextFunction } from "express";
import {
  createLocation,
  getEventLocations,
  updateLocation,
  deleteLocation,
} from "../services/location.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const locationController = {
  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEventLocations(
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
      const result = await createLocation(
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
      const result = await updateLocation(
        req.params.locationId as string,
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
      await deleteLocation(
        req.params.locationId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
