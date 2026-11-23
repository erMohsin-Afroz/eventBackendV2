
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface CreateInquiryInput {
  eventId: string;
  subject: string;
  description: string;
  category?: string;
  priority?: string;
}

interface UpdateInquiryInput {
  status?: string;
  priority?: string;
  organiserResponse?: string | null;
  internalNote?: string | null;
}

export async function createSupportInquiry(
  attendeeId: string,
  tenantId: string,
  data: CreateInquiryInput,
) {
  const [event, attendee] = await Promise.all([
    prisma.event.findFirst({
      where: { id: data.eventId, tenantId },
    }),
    prisma.user.findFirst({
      where: { id: attendeeId, tenantId, isActive: true },
    }),
  ]);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (!attendee) {
    throw new AppError("Attendee not found", 404);
  }

  return prisma.eventSupportInquiry.create({
    data: {
      id: randomUUID(),
      eventId: data.eventId,
      attendeeId,
      attendeeName: attendee.fullName,
      attendeeEmail: attendee.email,
      subject: data.subject,
      description: data.description,
      category: data.category ?? "General Inquiry",
      priority: data.priority ?? "normal",
      status: "new",
      submittedAt: new Date(),
    },
  });
}

export async function getMySupportInquiries(
  attendeeId: string,
  tenantId: string,
) {
  return prisma.eventSupportInquiry.findMany({
    where: {
      attendeeId,
      event: { tenantId },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getEventSupportInquiries(
  eventId: string,
  organiserId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.eventSupportInquiry.findMany({
    where: { eventId },
    orderBy: { submittedAt: "desc" },
  });
}

export async function updateSupportInquiry(
  inquiryId: string,
  organiserId: string,
  tenantId: string,
  data: UpdateInquiryInput,
) {
  const inquiry = await prisma.eventSupportInquiry.findFirst({
    where: {
      id: inquiryId,
      event: { organiserId, tenantId },
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found or access denied", 404);
  }

  const resolvedAt =
    data.status === "resolved" || data.status === "closed"
      ? new Date()
      : data.status
        ? null
        : undefined;

  return prisma.eventSupportInquiry.update({
    where: { id: inquiryId },
    data: {
      ...data,
      ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      updatedAt: new Date(),
    },
  });
}
