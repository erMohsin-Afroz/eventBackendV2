
import { Request, Response, NextFunction } from "express";
import {
  createAgendaDay,
  getAgendaDays,
  updateAgendaDay,
  deleteAgendaDay,
} from "../services/agenda.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const agendaController = {
  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getAgendaDays(req.params.eventId as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createAgendaDay(
        req.params.eventId as string,
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message: "Agenda day created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await updateAgendaDay(
        req.params.agendaDayId as string,
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
      await deleteAgendaDay(
        req.params.agendaDayId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({
        success: true,
        message: "Agenda day deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
