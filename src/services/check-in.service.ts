
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function checkInAttendee(
  eventId: string,
  qrToken: string,
  checkedInBy: string,
  tenantId: string,
) {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findFirst({
      where: {
        eventId,
        qrToken,
        tenantId,
      },
    });

    if (!registration) {
      throw new AppError("Invalid QR code", 404);
    }

    if (registration.registrationStatus !== "confirmed") {
      throw new AppError("Registration is not confirmed", 400);
    }

    if (registration.approvalStatus !== "approved") {
      throw new AppError("Registration is not approved", 400);
    }

    if (registration.isCheckedIn) {
      throw new AppError("Attendee has already checked in", 409);
    }

    const event = await tx.event.findFirst({
      where: { id: eventId, tenantId },
      select: { id: true },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const checkIn = await tx.checkIn.create({
      data: {
        id: randomUUID(),
        eventId,
        registrationId: registration.id,
        attendeeId: registration.attendeeId,
        checkInTime: new Date(),
        checkedInBy,
      },
    });

    await tx.registration.update({
      where: { id: registration.id },
      data: {
        isCheckedIn: true,
        checkInTime: checkIn.checkInTime,
      },
    });

    return checkIn;
  });
}

export async function getEventCheckIns(
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

  return prisma.checkIn.findMany({
    where: { eventId },
    orderBy: { checkInTime: "desc" },
  });
}
