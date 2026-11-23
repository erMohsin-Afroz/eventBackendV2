import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const helpDeskRepository = {
  findById(id: string) {
    return prisma.eventHelpDeskContact.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.eventHelpDeskContact.findMany({
      where: {
        eventId,
        isEnabled: true,
        isPublished: true,
      },
      orderBy: { displayOrder: "asc" },
    });
  },

  findMany(
    where: Prisma.EventHelpDeskContactWhereInput = {},
  ) {
    return prisma.eventHelpDeskContact.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });
  },

  create(
    data: Prisma.EventHelpDeskContactUncheckedCreateInput,
  ) {
    return prisma.eventHelpDeskContact.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.EventHelpDeskContactUncheckedUpdateInput,
  ) {
    return prisma.eventHelpDeskContact.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.eventHelpDeskContact.delete({
      where: { id },
    });
  },
};