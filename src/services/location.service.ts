
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface LocationInput {
  name?: string;
  building?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  capacity?: number | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationType?: string | null;
}

export async function createLocation(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: LocationInput,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.location.create({
    data: {
      id: randomUUID(),
      eventId,
      name: data.name!,
      building: data.building,
      floor: data.floor,
      roomNumber: data.roomNumber,
      capacity: data.capacity,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      locationType: data.locationType,
    },
  });
}

export async function getEventLocations(eventId: string) {
  return prisma.location.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });
}

export async function updateLocation(
  locationId: string,
  organiserId: string,
  tenantId: string,
  data: LocationInput,
) {
  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      event: { organiserId, tenantId },
    },
  });

  if (!location) {
    throw new AppError("Location not found or access denied", 404);
  }

  return prisma.location.update({
    where: { id: locationId },
    data,
  });
}

export async function deleteLocation(
  locationId: string,
  organiserId: string,
  tenantId: string,
) {
  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      event: { organiserId, tenantId },
    },
  });

  if (!location) {
    throw new AppError("Location not found or access denied", 404);
  }

  return prisma.location.delete({
    where: { id: locationId },
  });
}
