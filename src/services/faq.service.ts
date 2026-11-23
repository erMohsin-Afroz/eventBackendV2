
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface FaqInput {
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
  status?: string;
}

export async function createFaq(
  eventId: string | null,
  organiserId: string,
  tenantId: string,
  data: FaqInput,
) {
  if (eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organiserId, tenantId },
      select: { id: true },
    });

    if (!event) {
      throw new AppError("Event not found or access denied", 404);
    }
  }

  return prisma.faq.create({
    data: {
      id: randomUUID(),
      eventId,
      question: data.question!,
      answer: data.answer!,
      category: data.category ?? "General",
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? "published",
      createdAt: new Date(),
    },
  });
}

export async function getPublishedFaqs(eventId?: string) {
  return prisma.faq.findMany({
    where: {
      status: "published",
      ...(eventId ? { eventId } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateFaq(
  faqId: string,
  organiserId: string,
  tenantId: string,
  data: FaqInput,
) {
  const faq = await prisma.faq.findFirst({
    where: {
      id: faqId,
      OR: [
        { event: { organiserId, tenantId } },
        { eventId: null },
      ],
    },
  });

  if (!faq) {
    throw new AppError("FAQ not found or access denied", 404);
  }

  return prisma.faq.update({
    where: { id: faqId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteFaq(
  faqId: string,
  organiserId: string,
  tenantId: string,
) {
  const faq = await prisma.faq.findFirst({
    where: {
      id: faqId,
      event: { organiserId, tenantId },
    },
  });

  if (!faq) {
    throw new AppError("FAQ not found or access denied", 404);
  }

  return prisma.faq.delete({
    where: { id: faqId },
  });
}
