import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const checkInRepository = {
  findById(id: string) {
    return prisma.checkIn.findUnique({
      where: { id },
    });
  },

  findByRegistrationId(registrationId: string) {
    return prisma.checkIn.findUnique({
      where: { registrationId },
    });
  },

  findByEventId(eventId: string) {
    return prisma.checkIn.findMany({
      where: { eventId },
      orderBy: { checkInTime: "desc" },
    });
  },

  findByAttendeeId(attendeeId: string) {
    return prisma.checkIn.findMany({
      where: { attendeeId },
      orderBy: { checkInTime: "desc" },
    });
  },

  create(data: Prisma.CheckInUncheckedCreateInput) {
    return prisma.checkIn.create({
      data,
    });
  },

  delete(id: string) {
    return prisma.checkIn.delete({
      where: { id },
    });
  },

  count(where: Prisma.CheckInWhereInput = {}) {
    return prisma.checkIn.count({ where });
  },
};