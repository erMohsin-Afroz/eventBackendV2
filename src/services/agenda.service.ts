
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface AgendaDayInput {
  title?: string;
  agendaDate?: Date;
  sortOrder?: number;
}

export async function createAgendaDay(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: AgendaDayInput,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.agendaDay.create({
    data: {
      id: randomUUID(),
      eventId,
      title: data.title!,
      agendaDate: data.agendaDate!,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function getAgendaDays(eventId: string) {
  return prisma.agendaDay.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
    include: {
      sessions: {
        orderBy: { startTime: "asc" },
      },
    },
  });
}

export async function updateAgendaDay(
  agendaDayId: string,
  organiserId: string,
  tenantId: string,
  data: AgendaDayInput,
) {
  const agendaDay = await prisma.agendaDay.findFirst({
    where: {
      id: agendaDayId,
      event: { organiserId, tenantId },
    },
  });

  if (!agendaDay) {
    throw new AppError("Agenda day not found or access denied", 404);
  }

  return prisma.agendaDay.update({
    where: { id: agendaDayId },
    data,
  });
}

export async function deleteAgendaDay(
  agendaDayId: string,
  organiserId: string,
  tenantId: string,
) {
  const agendaDay = await prisma.agendaDay.findFirst({
    where: {
      id: agendaDayId,
      event: { organiserId, tenantId },
    },
  });

  if (!agendaDay) {
    throw new AppError("Agenda day not found or access denied", 404);
  }

  return prisma.agendaDay.delete({
    where: { id: agendaDayId },
  });
}
