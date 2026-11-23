
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function submitFeedback(
  eventId: string,
  attendeeId: string,
  tenantId: string,
  rating: number,
  comments?: string | null,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, tenantId },
    select: { id: true },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const attendee = await prisma.user.findFirst({
    where: { id: attendeeId, tenantId, isActive: true },
  });

  if (!attendee) {
    throw new AppError("Attendee not found", 404);
  }

  const registration = await prisma.registration.findFirst({
    where: {
      eventId,
      attendeeId,
      tenantId,
      registrationStatus: "confirmed",
    },
  });

  if (!registration) {
    throw new AppError("Only confirmed attendees can submit feedback", 403);
  }

  const existing = await prisma.feedbackSubmission.findUnique({
    where: {
      eventId_attendeeId: { eventId, attendeeId },
    },
  });

  if (existing) {
    throw new AppError("Feedback has already been submitted", 409);
  }

  return prisma.feedbackSubmission.create({
    data: {
      id: randomUUID(),
      eventId,
      attendeeId,
      tenantId,
      attendeeName: attendee.fullName,
      attendeeEmail: attendee.email,
      rating,
      comments,
      submittedAt: new Date(),
    },
  });
}

export async function getEventFeedback(
  eventId: string,
  organiserId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
    select: { id: true },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.feedbackSubmission.findMany({
    where: { eventId, tenantId },
    orderBy: { submittedAt: "desc" },
  });
}
