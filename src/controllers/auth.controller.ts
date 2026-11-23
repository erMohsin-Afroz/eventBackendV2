
import type { Request, Response, NextFunction } from "express";

import {
  signup,
  login,
} from "../services/auth.service.js";

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signup(req.body);

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await login(req.body);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
