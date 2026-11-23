
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function createInvitations(
  eventId: string,
  organiserId: string,
  tenantId: string,
  emails: string[],
  expiresAt?: Date | null,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  if (expiresAt && expiresAt <= new Date()) {
    throw new AppError("Invitation expiry must be in the future", 400);
  }

  return prisma.$transaction(
    emails.map((email) =>
      prisma.invitation.create({
        data: {
          id: randomUUID(),
          eventId,
          email: email.toLowerCase().trim(),
          invitationCode: randomUUID(),
          invitationStatus: "sent",
          createdAt: new Date(),
          expiresAt: expiresAt ?? null,
        },
      }),
    ),
  );
}

export async function getEventInvitations(
  eventId: string,
  organiserId: string,
  tenantId: string,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
    select: { id: true },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.invitation.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      eventId: true,
      email: true,
      invitationStatus: true,
      createdAt: true,
      expiresAt: true,
    },
  });
}

export async function validateInvitationCode(code: string) {
  const invitation = await prisma.invitation.findFirst({
    where: {
      invitationCode: code,
      invitationStatus: "sent",
    },
  });

  if (!invitation) {
    throw new AppError("Invalid or already used invitation", 404);
  }

  if (invitation.expiresAt && invitation.expiresAt <= new Date()) {
    throw new AppError("Invitation has expired", 400);
  }

  return {
    id: invitation.id,
    eventId: invitation.eventId,
    email: invitation.email,
  };
}
