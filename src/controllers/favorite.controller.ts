
import { Request, Response, NextFunction } from "express";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "../services/favorite.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const favoriteController = {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await addFavorite(
        user.id,
        user.tenantId,
        req.body.itemType,
        req.body.itemId,
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const itemType = req.query.itemType as
        | "event"
        | "session"
        | "speaker"
        | undefined;

      const result = await getUserFavorites(userId, itemType);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user.id;
      const itemType = req.params.itemType as
        | "event"
        | "session"
        | "speaker";

      await removeFavorite(
        userId,
        itemType,
        req.params.itemId as string,
      );

      res.status(200).json({
        success: true,
        message: "Favorite removed successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
