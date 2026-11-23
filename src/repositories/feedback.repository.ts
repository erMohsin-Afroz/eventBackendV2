import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const feedbackRepository = {
  findById(id: string) {
    return prisma.feedbackSubmission.findUnique({
      where: { id },
    });
  },

  findByEventAndAttendee(eventId: string, attendeeId: string) {
    return prisma.feedbackSubmission.findUnique({
      where: {
        eventId_attendeeId: {
          eventId,
          attendeeId,
        },
      },
    });
  },

  findByEventId(eventId: string) {
    return prisma.feedbackSubmission.findMany({
      where: { eventId },
      orderBy: { submittedAt: "desc" },
    });
  },

  findByAttendeeId(attendeeId: string) {
    return prisma.feedbackSubmission.findMany({
      where: { attendeeId },
      orderBy: { submittedAt: "desc" },
    });
  },

  create(data: Prisma.FeedbackSubmissionUncheckedCreateInput) {
    return prisma.feedbackSubmission.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.FeedbackSubmissionUncheckedUpdateInput,
  ) {
    return prisma.feedbackSubmission.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.feedbackSubmission.delete({
      where: { id },
    });
  },

  count(where: Prisma.FeedbackSubmissionWhereInput = {}) {
    return prisma.feedbackSubmission.count({ where });
  },

  aggregate(where: Prisma.FeedbackSubmissionWhereInput = {}) {
    return prisma.feedbackSubmission.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    });
  },
};