import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const quizRepository = {
  // Quiz queries

  findQuizById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
    });
  },

  findQuizByIdWithQuestions(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  findQuizzes(where: Prisma.QuizWhereInput = {}) {
    return prisma.quiz.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  findQuizzesByEvent(eventId: string) {
    return prisma.quiz.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  },

  createQuiz(data: Prisma.QuizUncheckedCreateInput) {
    return prisma.quiz.create({
      data,
    });
  },

  updateQuiz(
    id: string,
    data: Prisma.QuizUncheckedUpdateInput,
  ) {
    return prisma.quiz.update({
      where: { id },
      data,
    });
  },

  deleteQuiz(id: string) {
    return prisma.quiz.delete({
      where: { id },
    });
  },

  // Question queries

  findQuestionById(id: string) {
    return prisma.quizQuestion.findUnique({
      where: { id },
    });
  },

  findQuestionsByQuiz(quizId: string) {
    return prisma.quizQuestion.findMany({
      where: { quizId },
      orderBy: { sortOrder: "asc" },
    });
  },

  createQuestion(
    data: Prisma.QuizQuestionUncheckedCreateInput,
  ) {
    return prisma.quizQuestion.create({
      data,
    });
  },

  updateQuestion(
    id: string,
    data: Prisma.QuizQuestionUncheckedUpdateInput,
  ) {
    return prisma.quizQuestion.update({
      where: { id },
      data,
    });
  },

  deleteQuestion(id: string) {
    return prisma.quizQuestion.delete({
      where: { id },
    });
  },

  // Attempt queries

  findAttemptById(id: string) {
    return prisma.quizAttempt.findUnique({
      where: { id },
    });
  },

  findAttemptWithAnswers(id: string) {
    return prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        answers: true,
      },
    });
  },

  findAttemptsByAttendee(
    quizId: string,
    attendeeId: string,
  ) {
    return prisma.quizAttempt.findMany({
      where: {
        quizId,
        attendeeId,
      },
      orderBy: { startedAt: "desc" },
    });
  },

  findAttempts(where: Prisma.QuizAttemptWhereInput = {}) {
    return prisma.quizAttempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
    });
  },

  createAttempt(data: Prisma.QuizAttemptUncheckedCreateInput) {
    return prisma.quizAttempt.create({
      data,
    });
  },

  updateAttempt(
    id: string,
    data: Prisma.QuizAttemptUncheckedUpdateInput,
  ) {
    return prisma.quizAttempt.update({
      where: { id },
      data,
    });
  },

  // Answer queries

  findAnswersByAttempt(attemptId: string) {
    return prisma.quizAnswer.findMany({
      where: { attemptId },
    });
  },

  createAnswer(data: Prisma.QuizAnswerUncheckedCreateInput) {
    return prisma.quizAnswer.create({
      data,
    });
  },

  createManyAnswers(data: Prisma.QuizAnswerCreateManyInput[]) {
    return prisma.quizAnswer.createMany({
      data,
    });
  },

  updateAnswer(
    id: string,
    data: Prisma.QuizAnswerUncheckedUpdateInput,
  ) {
    return prisma.quizAnswer.update({
      where: { id },
      data,
    });
  },

  deleteAnswersByAttempt(attemptId: string) {
    return prisma.quizAnswer.deleteMany({
      where: { attemptId },
    });
  },

  countAttempts(where: Prisma.QuizAttemptWhereInput = {}) {
    return prisma.quizAttempt.count({ where });
  },
};