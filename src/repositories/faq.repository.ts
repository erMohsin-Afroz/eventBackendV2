import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const faqRepository = {
  findById(id: string) {
    return prisma.faq.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.faq.findMany({
      where: {
        eventId,
        status: "published",
      },
      orderBy: { sortOrder: "asc" },
    });
  },

  findGlobalFaqs() {
    return prisma.faq.findMany({
      where: {
        eventId: null,
        status: "published",
      },
      orderBy: { sortOrder: "asc" },
    });
  },

  findMany(where: Prisma.FaqWhereInput = {}) {
    return prisma.faq.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
  },

  create(data: Prisma.FaqUncheckedCreateInput) {
    return prisma.faq.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.FaqUncheckedUpdateInput,
  ) {
    return prisma.faq.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.faq.delete({
      where: { id },
    });
  },
};