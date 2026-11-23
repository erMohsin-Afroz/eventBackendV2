import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const locationRepository = {
  findById(id: string) {
    return prisma.location.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.location.findMany({
      where: { eventId },
      orderBy: { name: "asc" },
    });
  },

  create(data: Prisma.LocationUncheckedCreateInput) {
    return prisma.location.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.LocationUncheckedUpdateInput,
  ) {
    return prisma.location.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.location.delete({
      where: { id },
    });
  },
};