
import { Request, Response, NextFunction } from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../services/user.service.js";

type AuthRequest = Request & {
  user: {
    id: string;
    tenantId: string;
  };
};

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const result = await getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const result = await updateUserProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
