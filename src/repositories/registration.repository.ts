import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const registrationRepository = {
  findById(id: string) {
    return prisma.registration.findUnique({
      where: { id },
    });
  },

  findByQrToken(qrToken: string) {
    return prisma.registration.findUnique({
      where: { qrToken },
    });
  },

  findByEventAndAttendee(eventId: string, attendeeId: string) {
    return prisma.registration.findUnique({
      where: {
        eventId_attendeeId: {
          eventId,
          attendeeId,
        },
      },
    });
  },

  findByEventId(eventId: string) {
    return prisma.registration.findMany({
      where: { eventId },
      orderBy: { registeredAt: "desc" },
    });
  },

  findByAttendeeId(attendeeId: string) {
    return prisma.registration.findMany({
      where: { attendeeId },
      orderBy: { registeredAt: "desc" },
    });
  },

  findMany(where: Prisma.RegistrationWhereInput = {}) {
    return prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "desc" },
    });
  },

  create(data: Prisma.RegistrationUncheckedCreateInput) {
    return prisma.registration.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.RegistrationUncheckedUpdateInput,
  ) {
    return prisma.registration.update({
      where: { id },
      data,
    });
  },

  count(where: Prisma.RegistrationWhereInput = {}) {
    return prisma.registration.count({ where });
  },

  delete(id: string) {
    return prisma.registration.delete({
      where: { id },
    });
  },
};