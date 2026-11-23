
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface SpeakerInput {
  name?: string;
  designation?: string | null;
  organization?: string | null;
  biography?: string | null;
  profileImagePath?: string | null;
  topic?: string | null;
  email?: string | null;
  contactInformation?: string | null;
}

export async function createSpeaker(
  eventId: string,
  organiserId: string,
  tenantId: string,
  data: SpeakerInput,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId, tenantId },
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  return prisma.speaker.create({
    data: {
      id: randomUUID(),
      eventId,
      name: data.name!,
      designation: data.designation,
      organization: data.organization,
      biography: data.biography,
      profileImagePath: data.profileImagePath,
      topic: data.topic,
      email: data.email,
      contactInformation: data.contactInformation,
      createdAt: new Date(),
    },
  });
}

export async function getEventSpeakers(eventId: string) {
  return prisma.speaker.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });
}

export async function updateSpeaker(
  speakerId: string,
  organiserId: string,
  tenantId: string,
  data: SpeakerInput,
) {
  const speaker = await prisma.speaker.findFirst({
    where: {
      id: speakerId,
      event: { organiserId, tenantId },
    },
  });

  if (!speaker) {
    throw new AppError("Speaker not found or access denied", 404);
  }

  return prisma.speaker.update({
    where: { id: speakerId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteSpeaker(
  speakerId: string,
  organiserId: string,
  tenantId: string,
) {
  const speaker = await prisma.speaker.findFirst({
    where: {
      id: speakerId,
      event: { organiserId, tenantId },
    },
  });

  if (!speaker) {
    throw new AppError("Speaker not found or access denied", 404);
  }

  return prisma.speaker.delete({
    where: { id: speakerId },
  });
}
