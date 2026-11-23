
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface SessionInput {
  agendaDayId?: string | null;
  title?: string;
  description?: string | null;
  activityType?: string;
  speakerName?: string | null;
  locationName?: string | null;
  startTime?: string;
  endTime?: string;
  sessionDate?: Date;
}

export async function createSession(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: SessionInput,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  if (data.agendaDayId) {
    const agenda = await prisma.agendaDay.findFirst({
      where: { id: data.agendaDayId, eventId },
    });

    if (!agenda) {
      throw new AppError("Agenda day does not belong to this event", 400);
    }
  }

  return prisma.session.create({
    data: {
      id: randomUUID(),
      eventId,
      agendaDayId: data.agendaDayId ?? null,
      title: data.title!,
      description: data.description,
      activityType: data.activityType ?? "Keynote",
      speakerName: data.speakerName,
      locationName: data.locationName,
      startTime: data.startTime!,
      endTime: data.endTime!,
      sessionDate: data.sessionDate!,
      createdAt: new Date(),
    },
  });
}

export async function getEventSessions(eventId: string) {
  return prisma.session.findMany({
    where: { eventId },
    orderBy: [
      { sessionDate: "asc" },
      { startTime: "asc" },
    ],
  });
}

export async function updateSession(
  sessionId: string,
  organiserId: string,
  tenantId: string,
  data: SessionInput,
) {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      event: { organiserId, tenantId },
    },
  });

  if (!session) {
    throw new AppError("Session not found or access denied", 404);
  }

  if (data.agendaDayId) {
    const agenda = await prisma.agendaDay.findFirst({
      where: { id: data.agendaDayId, eventId: session.eventId },
    });

    if (!agenda) {
      throw new AppError("Invalid agenda day", 400);
    }
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteSession(
  sessionId: string,
  organiserId: string,
  tenantId: string,
) {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      event: { organiserId, tenantId },
    },
  });

  if (!session) {
    throw new AppError("Session not found or access denied", 404);
  }

  return prisma.session.delete({
    where: { id: sessionId },
  });
}

export async function toggleSessionFavorite(
  sessionId: string,
  isFavorite: boolean,
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: { isFavorite },
  });
}
