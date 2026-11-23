
import { Request, Response, NextFunction } from "express";
import {
  getOrganiserProfile,
  createOrganiserProfile,
  updateOrganiserProfile,
} from "../services/organiser.service.js";

type AuthRequest = Request & {
  user: {
    id: string;
  };
};

export const organiserController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const result = await getOrganiserProfile(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const result = await createOrganiserProfile(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Organiser profile created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const result = await updateOrganiserProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Organiser profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
