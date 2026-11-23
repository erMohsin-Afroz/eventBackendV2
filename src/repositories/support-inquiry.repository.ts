import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const supportInquiryRepository = {
  findById(id: string) {
    return prisma.eventSupportInquiry.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.eventSupportInquiry.findMany({
      where: { eventId },
      orderBy: { submittedAt: "desc" },
    });
  },

  findByAttendeeId(attendeeId: string) {
    return prisma.eventSupportInquiry.findMany({
      where: { attendeeId },
      orderBy: { submittedAt: "desc" },
    });
  },

  findMany(
    where: Prisma.EventSupportInquiryWhereInput = {},
  ) {
    return prisma.eventSupportInquiry.findMany({
      where,
      orderBy: { submittedAt: "desc" },
    });
  },

  create(
    data: Prisma.EventSupportInquiryUncheckedCreateInput,
  ) {
    return prisma.eventSupportInquiry.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.EventSupportInquiryUncheckedUpdateInput,
  ) {
    return prisma.eventSupportInquiry.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.eventSupportInquiry.delete({
      where: { id },
    });
  },

  count(where: Prisma.EventSupportInquiryWhereInput = {}) {
    return prisma.eventSupportInquiry.count({ where });
  },
};