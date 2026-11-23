
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getEventAnalytics(
  eventId: string,
  organiserId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  const [
    totalRegistrations,
    confirmedRegistrations,
    waitlistedRegistrations,
    cancelledRegistrations,
    checkedInCount,
    feedbackCount,
    feedbackAggregate,
    totalSessions,
    totalSpeakers,
    totalQuizzes,
  ] = await Promise.all([
    prisma.registration.count({
      where: { eventId, tenantId },
    }),

    prisma.registration.count({
      where: {
        eventId,
        tenantId,
        registrationStatus: "confirmed",
      },
    }),

    prisma.registration.count({
      where: {
        eventId,
        tenantId,
        registrationStatus: "waitlisted",
      },
    }),

    prisma.registration.count({
      where: {
        eventId,
        tenantId,
        registrationStatus: "cancelled",
      },
    }),

    prisma.checkIn.count({
      where: { eventId },
    }),

    prisma.feedbackSubmission.count({
      where: { eventId, tenantId },
    }),

    prisma.feedbackSubmission.aggregate({
      where: { eventId, tenantId },
      _avg: { rating: true },
    }),

    prisma.session.count({
      where: { eventId },
    }),

    prisma.speaker.count({
      where: { eventId },
    }),

    prisma.quiz.count({
      where: { eventId, tenantId },
    }),
  ]);

  return {
    event: {
      id: event.id,
      name: event.eventName,
      maximumCapacity: event.maximumCapacity,
      attendeeCount: event.attendeeCount,
    },
    registrations: {
      total: totalRegistrations,
      confirmed: confirmedRegistrations,
      waitlisted: waitlistedRegistrations,
      cancelled: cancelledRegistrations,
    },
    checkIns: {
      total: checkedInCount,
    },
    feedback: {
      total: feedbackCount,
      averageRating: feedbackAggregate._avg.rating ?? 0,
    },
    sessions: totalSessions,
    speakers: totalSpeakers,
    quizzes: totalQuizzes,
  };
}

export async function getOrganiserDashboard(
  organiserId: string,
  tenantId: string,
) {
  const events = await prisma.event.findMany({
    where: { organiserId, tenantId },
    select: {
      id: true,
      eventName: true,
      eventStatus: true,
      startDate: true,
      endDate: true,
      attendeeCount: true,
      maximumCapacity: true,
    },
    orderBy: { startDate: "desc" },
  });

  const eventIds = events.map((event) => event.id);

  const [
    totalRegistrations,
    totalCheckIns,
    totalFeedback,
  ] = eventIds.length
    ? await Promise.all([
        prisma.registration.count({
          where: {
            eventId: { in: eventIds },
            tenantId,
          },
        }),

        prisma.checkIn.count({
          where: {
            eventId: { in: eventIds },
          },
        }),

        prisma.feedbackSubmission.count({
          where: {
            eventId: { in: eventIds },
            tenantId,
          },
        }),
      ])
    : [0, 0, 0];

  return {
    totalEvents: events.length,
    totalRegistrations,
    totalCheckIns,
    totalFeedback,
    events,
  };
}
