import { prisma } from "../config/prisma";

export const analyticsRepository = {
  countEvents(organiserId?: string) {
    return prisma.event.count({
      where: organiserId ? { organiserId } : {},
    });
  },

  countRegistrations(eventId?: string) {
    return prisma.registration.count({
      where: eventId ? { eventId } : {},
    });
  },

  countConfirmedRegistrations(eventId?: string) {
    return prisma.registration.count({
      where: {
        ...(eventId ? { eventId } : {}),
        registrationStatus: "confirmed",
        approvalStatus: "approved",
      },
    });
  },

  countCheckIns(eventId?: string) {
    return prisma.checkIn.count({
      where: eventId ? { eventId } : {},
    });
  },

  countFeedback(eventId?: string) {
    return prisma.feedbackSubmission.count({
      where: eventId ? { eventId } : {},
    });
  },

  getFeedbackRating(eventId?: string) {
    return prisma.feedbackSubmission.aggregate({
      where: eventId ? { eventId } : {},
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
  },

  countSupportInquiries(eventId?: string) {
    return prisma.eventSupportInquiry.count({
      where: eventId ? { eventId } : {},
    });
  },

  countQuizAttempts(eventId?: string) {
    return prisma.quizAttempt.count({
      where: eventId ? { eventId } : {},
    });
  },
};