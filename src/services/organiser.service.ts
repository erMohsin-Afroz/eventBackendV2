
import { randomUUID } from "node:crypto";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface OrganiserProfileData {
  organisationName?: string | null;
  organiserType?: string | null;
  designation?: string | null;
  description?: string | null;
}

export async function getOrganiserProfile(userId: string) {
  const profile = await prisma.organiserProfile.findFirst({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Organiser profile not found", 404);
  }

  return profile;
}

export async function createOrganiserProfile(
  userId: string,
  data: OrganiserProfileData,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "organiser") {
    throw new AppError("Only organisers can create this profile", 403);
  }

  const existing = await prisma.organiserProfile.findFirst({
    where: { userId },
  });

  if (existing) {
    throw new AppError("Organiser profile already exists", 409);
  }

  return prisma.organiserProfile.create({
    data: {
      id: randomUUID(),
      userId,
      ...data,
      createdAt: new Date(),
    },
  });
}

export async function updateOrganiserProfile(
  userId: string,
  data: OrganiserProfileData,
) {
  const profile = await prisma.organiserProfile.findFirst({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Organiser profile not found", 404);
  }

  return prisma.organiserProfile.update({
    where: { id: profile.id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}
