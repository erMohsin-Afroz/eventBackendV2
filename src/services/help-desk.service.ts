
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface HelpDeskInput {
  title?: string;
  description?: string | null;
  contactType?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  operatingHours?: string | null;
  displayOrder?: number;
  isEnabled?: boolean;
  isPublished?: boolean;
}

export async function createHelpDeskContact(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: HelpDeskInput,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.eventHelpDeskContact.create({
    data: {
      id: randomUUID(),
      eventId,
      title: data.title!,
      description: data.description,
      contactType: data.contactType ?? "General Support",
      email: data.email,
      phone: data.phone,
      location: data.location,
      operatingHours: data.operatingHours,
      displayOrder: data.displayOrder ?? 0,
      isEnabled: data.isEnabled ?? true,
      isPublished: data.isPublished ?? true,
      createdAt: new Date(),
    },
  });
}

export async function getPublishedHelpDeskContacts(eventId: string) {
  return prisma.eventHelpDeskContact.findMany({
    where: {
      eventId,
      isEnabled: true,
      isPublished: true,
    },
    orderBy: { displayOrder: "asc" },
  });
}

export async function updateHelpDeskContact(
  contactId: string,
  organiserId: string,
  tenantId: string,
  data: HelpDeskInput,
) {
  const contact = await prisma.eventHelpDeskContact.findFirst({
    where: {
      id: contactId,
      event: { organiserId, tenantId },
    },
  });

  if (!contact) {
    throw new AppError("Help desk contact not found or access denied", 404);
  }

  return prisma.eventHelpDeskContact.update({
    where: { id: contactId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteHelpDeskContact(
  contactId: string,
  organiserId: string,
  tenantId: string,
) {
  const contact = await prisma.eventHelpDeskContact.findFirst({
    where: {
      id: contactId,
      event: { organiserId, tenantId },
    },
  });

  if (!contact) {
    throw new AppError("Help desk contact not found or access denied", 404);
  }

  return prisma.eventHelpDeskContact.delete({
    where: { id: contactId },
  });
}
