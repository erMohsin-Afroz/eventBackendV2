import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const speakerRepository = {
  findById(id: string) {
    return prisma.speaker.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.speaker.findMany({
      where: { eventId },
      orderBy: { name: "asc" },
    });
  },

  create(data: Prisma.SpeakerUncheckedCreateInput) {
    return prisma.speaker.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.SpeakerUncheckedUpdateInput,
  ) {
    return prisma.speaker.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.speaker.delete({
      where: { id },
    });
  },
};