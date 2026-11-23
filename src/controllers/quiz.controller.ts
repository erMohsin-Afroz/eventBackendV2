
import { Request, Response, NextFunction } from "express";
import {
  createQuiz,
  getPublishedQuizzes,
  getQuizForAttendee,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttemptResult,
} from "../services/quiz.service.js";

type AuthRequest = Request & {
  user: { id: string; tenantId: string };
};

export const quizController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await createQuiz(
        user.id,
        user.tenantId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getPublishedQuizzes(
        req.params.eventId as string,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getForAttendee(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as AuthRequest).user.tenantId;
      const result = await getQuizForAttendee(
        req.params.quizId as string,
        tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await startQuizAttempt(
        req.params.quizId as string,
        user.id,
        user.tenantId,
      );

      res.status(201).json({
        success: true,
        message: "Quiz attempt started",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await submitQuizAttempt(
        req.params.attemptId as string,
        user.id,
        user.tenantId,
        req.body.answers,
      );

      res.status(200).json({
        success: true,
        message: "Quiz submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthRequest).user;
      const result = await getQuizAttemptResult(
        req.params.attemptId as string,
        user.id,
        user.tenantId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
