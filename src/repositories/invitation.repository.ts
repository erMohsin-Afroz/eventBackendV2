import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const invitationRepository = {
  findById(id: string) {
    return prisma.invitation.findUnique({
      where: { id },
    });
  },

  findByCode(invitationCode: string) {
    return prisma.invitation.findFirst({
      where: { invitationCode },
    });
  },

  findByEventId(eventId: string) {
    return prisma.invitation.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByEmailAndEvent(email: string, eventId: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
        eventId,
      },
    });
  },

  create(data: Prisma.InvitationUncheckedCreateInput) {
    return prisma.invitation.create({
      data,
    });
  },

  createMany(data: Prisma.InvitationCreateManyInput[]) {
    return prisma.invitation.createMany({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.InvitationUncheckedUpdateInput,
  ) {
    return prisma.invitation.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.invitation.delete({
      where: { id },
    });
  },
};