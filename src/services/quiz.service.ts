
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface QuestionInput {
  questionText: string;
  questionType: string;
  options: unknown[];
  correctAnswer: unknown;
  marks?: number;
  allowPartialMarks?: boolean;
  explanation?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

interface CreateQuizInput {
  eventId: string;
  agendaId?: string | null;
  title: string;
  description: string;
  instructions: string;
  quizType: string;
  difficulty: string;
  passingPercentage?: number;
  durationMinutes?: number;
  maxAttempts?: number;
  availabilityMode?: string;
  startAt?: Date | null;
  endAt?: Date | null;
  status?: string;
  isEnabled?: boolean;
  resultVisibility?: string;
  questions: QuestionInput[];
}

function serializeQuestion(question: QuestionInput) {
  return {
    id: randomUUID(),
    questionText: question.questionText,
    questionType: question.questionType,
    optionsJson: JSON.stringify(question.options),
    correctAnswerJson: JSON.stringify(question.correctAnswer),
    marks: question.marks ?? 1,
    allowPartialMarks: question.allowPartialMarks ?? false,
    explanation: question.explanation ?? null,
    imageUrl: question.imageUrl ?? null,
    sortOrder: question.sortOrder ?? 0,
  };
}

export async function createQuiz(
  organiserId: string,
  tenantId: string,
  data: CreateQuizInput,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: data.eventId,
      organiserId,
      tenantId,
    },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  if (data.agendaId) {
    const session = await prisma.session.findFirst({
      where: {
        id: data.agendaId,
        eventId: data.eventId,
      },
    });

    if (!session) {
      throw new AppError("Invalid agenda session", 400);
    }
  }

  if (data.startAt && data.endAt && data.endAt <= data.startAt) {
    throw new AppError("Quiz end time must be after start time", 400);
  }

  if (data.questions.length === 0) {
    throw new AppError("Quiz must contain at least one question", 400);
  }

  const questions = data.questions.map(serializeQuestion);

  const totalMarks = questions.reduce(
    (total, question) => total + question.marks,
    0,
  );

  return prisma.quiz.create({
    data: {
      id: randomUUID(),
      tenantId,
      eventId: data.eventId,
      agendaId: data.agendaId ?? null,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      quizType: data.quizType,
      difficulty: data.difficulty,
      totalQuestions: questions.length,
      totalMarks,
      passingPercentage: data.passingPercentage ?? 50,
      durationMinutes: data.durationMinutes ?? 15,
      maxAttempts: data.maxAttempts ?? 1,
      availabilityMode: data.availabilityMode ?? "manual",
      startAt: data.startAt ?? null,
      endAt: data.endAt ?? null,
      status: data.status ?? "draft",
      isEnabled: data.isEnabled ?? true,
      resultVisibility:
        data.resultVisibility ?? "hidden_until_released",
      areAnswersReleased: false,
      createdBy: organiserId,
      createdAt: new Date(),
      questions: {
        create: questions,
      },
    },
    include: {
      questions: {
        select: {
          id: true,
          questionText: true,
          questionType: true,
          optionsJson: true,
          marks: true,
          sortOrder: true,
        },
      },
    },
  });
}

export async function getPublishedQuizzes(
  eventId: string,
  tenantId: string,
) {
  return prisma.quiz.findMany({
    where: {
      eventId,
      tenantId,
      status: "published",
      isEnabled: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      instructions: true,
      quizType: true,
      difficulty: true,
      totalQuestions: true,
      totalMarks: true,
      passingPercentage: true,
      durationMinutes: true,
      maxAttempts: true,
      availabilityMode: true,
      startAt: true,
      endAt: true,
      status: true,
    },
  });
}

export async function getQuizForAttendee(
  quizId: string,
  tenantId: string,
) {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      tenantId,
      status: "published",
      isEnabled: true,
    },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          questionText: true,
          questionType: true,
          optionsJson: true,
          marks: true,
          allowPartialMarks: true,
          imageUrl: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!quiz) {
    throw new AppError("Quiz not found or unavailable", 404);
  }

  return quiz;
}

export async function startQuizAttempt(
  quizId: string,
  attendeeId: string,
  tenantId: string,
) {
  return prisma.$transaction(async (tx) => {
    const quiz = await tx.quiz.findFirst({
      where: {
        id: quizId,
        tenantId,
        status: "published",
        isEnabled: true,
      },
    });

    if (!quiz) {
      throw new AppError("Quiz is unavailable", 404);
    }

    const now = new Date();

    if (quiz.availabilityMode === "scheduled") {
      if (quiz.startAt && now < quiz.startAt) {
        throw new AppError("Quiz has not started yet", 400);
      }

      if (quiz.endAt && now > quiz.endAt) {
        throw new AppError("Quiz availability has ended", 400);
      }
    }

    const existingAttempt = await tx.quizAttempt.findFirst({
      where: {
        quizId,
        attendeeId,
        tenantId,
        status: "in_progress",
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    const completedAttempts = await tx.quizAttempt.count({
      where: {
        quizId,
        attendeeId,
        tenantId,
        status: "submitted",
      },
    });

    if (completedAttempts >= quiz.maxAttempts) {
      throw new AppError("Maximum quiz attempts reached", 403);
    }

    const attendee = await tx.user.findFirst({
      where: { id: attendeeId, tenantId, isActive: true },
    });

    if (!attendee) {
      throw new AppError("Attendee not found", 404);
    }

    return tx.quizAttempt.create({
      data: {
        id: randomUUID(),
        tenantId,
        eventId: quiz.eventId,
        quizId,
        agendaId: quiz.agendaId,
        attendeeId,
        attendeeName: attendee.fullName,
        attendeeEmail: attendee.email,
        attemptNumber: completedAttempts + 1,
        startedAt: now,
        status: "in_progress",
        totalMarks: quiz.totalMarks,
      },
    });
  });
}

function normalizeAnswer(value: unknown): string {
  return JSON.stringify(value);
}

export async function submitQuizAttempt(
  attemptId: string,
  attendeeId: string,
  tenantId: string,
  answers: Array<{
    questionId: string;
    selectedAnswer: unknown;
  }>,
) {
  return prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.findFirst({
      where: {
        id: attemptId,
        attendeeId,
        tenantId,
        status: "in_progress",
      },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError("Active quiz attempt not found", 404);
    }

    const now = new Date();
    const durationSeconds = Math.floor(
      (now.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    const durationLimit = attempt.quiz.durationMinutes * 60;

    if (durationSeconds > durationLimit) {
      throw new AppError("Quiz time limit exceeded", 400);
    }

    const questionMap = new Map(
      attempt.quiz.questions.map((question) => [
        question.id,
        question,
      ]),
    );

    const submittedIds = new Set<string>();

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    const answerRecords = [];

    for (const answer of answers) {
      if (submittedIds.has(answer.questionId)) {
        throw new AppError("Duplicate question answer submitted", 400);
      }

      submittedIds.add(answer.questionId);

      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new AppError("Invalid question in submission", 400);
      }

      const isCorrect =
        normalizeAnswer(answer.selectedAnswer) ===
        question.correctAnswerJson;

      const marksObtained = isCorrect ? question.marks : 0;

      if (isCorrect) {
        correctAnswers++;
        score += marksObtained;
      } else {
        incorrectAnswers++;
      }

      answerRecords.push({
        id: randomUUID(),
        attemptId,
        questionId: question.id,
        selectedAnswerJson: normalizeAnswer(answer.selectedAnswer),
        isCorrect,
        marksObtained,
        answeredAt: now,
      });
    }

    const unansweredQuestions =
      attempt.quiz.questions.length - submittedIds.size;

    const percentage =
      attempt.quiz.totalMarks > 0
        ? (score / attempt.quiz.totalMarks) * 100
        : 0;

    const result =
      percentage >= attempt.quiz.passingPercentage
        ? "passed"
        : "failed";

    await tx.quizAnswer.createMany({
      data: answerRecords,
    });

    const updatedAttempt = await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: now,
        status: "submitted",
        score,
        totalMarks: attempt.quiz.totalMarks,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unansweredQuestions,
        timeTakenSeconds: durationSeconds,
        result,
      },
    });

    return {
      attemptId: updatedAttempt.id,
      score,
      totalMarks: updatedAttempt.totalMarks,
      percentage,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      result,
    };
  });
}

export async function getQuizAttemptResult(
  attemptId: string,
  attendeeId: string,
  tenantId: string,
) {
  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      id: attemptId,
      attendeeId,
      tenantId,
      status: "submitted",
    },
    include: {
      quiz: {
        select: {
          title: true,
          resultVisibility: true,
          areAnswersReleased: true,
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    throw new AppError("Quiz result not found", 404);
  }

  const canViewResult =
    attempt.quiz.resultVisibility === "immediate" ||
    attempt.quiz.areAnswersReleased;

  if (!canViewResult) {
    throw new AppError("Quiz results have not been released", 403);
  }

  return {
    id: attempt.id,
    quizTitle: attempt.quiz.title,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    result: attempt.result,
    correctAnswers: attempt.correctAnswers,
    incorrectAnswers: attempt.incorrectAnswers,
    unansweredQuestions: attempt.unansweredQuestions,
    answers: attempt.quiz.areAnswersReleased
      ? attempt.answers
      : undefined,
  };
}
