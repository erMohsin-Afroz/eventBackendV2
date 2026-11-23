import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const eventRepository = {
  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
    });
  },

  findByIdWithDetails(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organiser: true,
        agendaDays: {
          orderBy: { sortOrder: "asc" },
        },
        sessions: {
          orderBy: { startTime: "asc" },
        },
        locations: true,
        speakers: true,
      },
    });
  },

  findMany(where: Prisma.EventWhereInput = {}) {
    return prisma.event.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findByOrganiser(organiserId: string) {
    return prisma.event.findMany({
      where: { organiserId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.EventUncheckedUpdateInput,
  ) {
    return prisma.event.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.event.delete({
      where: { id },
    });
  },

  count(where: Prisma.EventWhereInput = {}) {
    return prisma.event.count({ where });
  },
};