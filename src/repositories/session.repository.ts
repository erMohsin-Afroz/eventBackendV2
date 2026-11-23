import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const sessionRepository = {
  findById(id: string) {
    return prisma.session.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.session.findMany({
      where: { eventId },
      orderBy: [
        { sessionDate: "asc" },
        { startTime: "asc" },
      ],
    });
  },

  findByAgendaDayId(agendaDayId: string) {
    return prisma.session.findMany({
      where: { agendaDayId },
      orderBy: { startTime: "asc" },
    });
  },

  create(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.SessionUncheckedUpdateInput,
  ) {
    return prisma.session.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.session.delete({
      where: { id },
    });
  },
};