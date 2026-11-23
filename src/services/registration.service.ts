
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function registerForEvent(
  eventId: string,
  attendeeId: string,
  tenantId: string,
) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,
        tenantId,
        eventStatus: "published",
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (!event.registrationOpen) {
      throw new AppError("Registration is closed", 400);
    }

    if (
      event.registrationDeadline &&
      event.registrationDeadline < new Date()
    ) {
      throw new AppError("Registration deadline has passed", 400);
    }

    const existing = await tx.registration.findUnique({
      where: {
        eventId_attendeeId: { eventId, attendeeId },
      },
    });

    if (existing && existing.registrationStatus !== "cancelled") {
      throw new AppError("Already registered for this event", 409);
    }

    const attendee = await tx.user.findFirst({
      where: { id: attendeeId, tenantId, isActive: true },
    });

    if (!attendee) {
      throw new AppError("Attendee not found", 404);
    }

    const confirmedCount = await tx.registration.count({
      where: {
        eventId,
        tenantId,
        registrationStatus: "confirmed",
      },
    });

    const isFull = confirmedCount >= event.maximumCapacity;

    if (isFull && !event.waitlistEnabled) {
      throw new AppError("Event capacity is full", 409);
    }

    const registrationStatus = isFull
      ? "waitlisted"
      : "confirmed";

    const approvalStatus = event.approvalRequired
      ? "pending"
      : "approved";

    const registrationData = {
      eventId,
      attendeeId,
      eventTitle: event.eventName,
      attendeeName: attendee.fullName,
      attendeeEmail: attendee.email,
      qrToken: randomUUID(),
      registrationStatus,
      approvalStatus,
      isCheckedIn: false,
      registeredAt: new Date(),
      cancellationDate: null,
      tenantId,
    };

    const registration = existing
      ? await tx.registration.update({
          where: { id: existing.id },
          data: registrationData,
        })
      : await tx.registration.create({
          data: {
            id: randomUUID(),
            ...registrationData,
          },
        });

    if (registrationStatus === "confirmed") {
      await tx.event.update({
        where: { id: eventId },
        data: { attendeeCount: { increment: 1 } },
      });
    }

    return registration;
  });
}

export async function cancelRegistration(
  registrationId: string,
  attendeeId: string,
  tenantId: string,
) {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findFirst({
      where: {
        id: registrationId,
        attendeeId,
        tenantId,
      },
    });

    if (!registration) {
      throw new AppError("Registration not found", 404);
    }

    if (registration.registrationStatus === "cancelled") {
      throw new AppError("Registration is already cancelled", 409);
    }

    await tx.registration.update({
      where: { id: registrationId },
      data: {
        registrationStatus: "cancelled",
        cancellationDate: new Date(),
      },
    });

    if (registration.registrationStatus === "confirmed") {
      await tx.event.update({
        where: { id: registration.eventId },
        data: { attendeeCount: { decrement: 1 } },
      });

      const next = await tx.registration.findFirst({
        where: {
          eventId: registration.eventId,
          tenantId,
          registrationStatus: "waitlisted",
          approvalStatus: "approved",
        },
        orderBy: { registeredAt: "asc" },
      });

      if (next) {
        await tx.registration.update({
          where: { id: next.id },
          data: { registrationStatus: "confirmed" },
        });

        await tx.event.update({
          where: { id: registration.eventId },
          data: { attendeeCount: { increment: 1 } },
        });
      }
    }

    return { success: true, message: "Registration cancelled" };
  });
}

export async function reviewRegistration(
  registrationId: string,
  organiserId: string,
  tenantId: string,
  approvalStatus: "approved" | "rejected" | "pending",
) {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findFirst({
      where: {
        id: registrationId,
        tenantId,
        event: { organiserId, tenantId },
      },
    });

    if (!registration) {
      throw new AppError("Registration not found or access denied", 404);
    }

    if (registration.registrationStatus === "cancelled") {
      throw new AppError("Cancelled registration cannot be reviewed", 400);
    }

    const updated = await tx.registration.update({
      where: { id: registrationId },
      data: { approvalStatus },
    });

    return updated;
  });
}

export async function getEventRegistrations(
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

  return prisma.registration.findMany({
    where: { eventId, tenantId },
    orderBy: { registeredAt: "desc" },
    select: {
      id: true,
      attendeeName: true,
      attendeeEmail: true,
      registrationStatus: true,
      approvalStatus: true,
      isCheckedIn: true,
      registeredAt: true,
    },
  });
}
