
import { randomUUID } from "node:crypto";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface CreateEventData {
  eventName: string;
  description: string;
  category: string;
  bannerPath?: string | null;
  eventFormat: string;
  startDate: Date;
  endDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  venueName: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  onlineMeetingUrl?: string | null;
  platformName?: string | null;
  visibility?: string;
  accessCode?: string | null;
  registrationDeadline?: Date | null;
  maximumCapacity?: number;
  registrationOpen?: boolean;
  approvalRequired?: boolean;
  waitlistEnabled?: boolean;
  eventStatus?: string;
}

export async function createEvent(
  organiserId: string,
  tenantId: string,
  data: CreateEventData,
) {
  const organiser = await prisma.user.findFirst({
    where: {
      id: organiserId,
      tenantId,
      isActive: true,
      role: "organiser",
    },
  });

  if (!organiser) {
    throw new AppError("Organiser not found or not authorised", 403);
  }

  return prisma.event.create({
    data: {
      id: randomUUID(),
      organiserId,
      organiserName: organiser.fullName,
      tenantId,
      ...data,
      createdAt: new Date(),
    },
  });
}

export async function getEventById(
  eventId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      tenantId,
    },
    include: {
      agendaDays: {
        orderBy: { sortOrder: "asc" },
      },
      sessions: true,
      locations: true,
      speakers: true,
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
}

export async function getPublishedEvents(tenantId: string) {
  return prisma.event.findMany({
    where: {
      tenantId,
      eventStatus: "published",
      visibility: "public",
    },
    orderBy: {
      startDate: "asc",
    },
  });
}

export async function updateEvent(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: Partial<CreateEventData>,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organiserId,
      tenantId,
    },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteEvent(
  eventId: string,
  organiserId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organiserId,
      tenantId,
    },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.event.delete({
    where: { id: eventId },
  });
}
