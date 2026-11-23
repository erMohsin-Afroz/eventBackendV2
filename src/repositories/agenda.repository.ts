import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const agendaRepository = {
  findById(id: string) {
    return prisma.agendaDay.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.agendaDay.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
    });
  },

  create(data: Prisma.AgendaDayUncheckedCreateInput) {
    return prisma.agendaDay.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.AgendaDayUncheckedUpdateInput,
  ) {
    return prisma.agendaDay.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.agendaDay.delete({
      where: { id },
    });
  },
};