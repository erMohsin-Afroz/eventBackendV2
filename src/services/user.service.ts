
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface UpdateProfileData {
  fullName?: string;
  mobileNumber?: string | null;
  designation?: string | null;
  organization?: string | null;
  profileImagePath?: string | null;
  about?: string | null;
  interests?: string | null;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      role: true,
      designation: true,
      organization: true,
      profileImagePath: true,
      about: true,
      interests: true,
      createdAt: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      designation: true,
      organization: true,
      profileImagePath: true,
      about: true,
      interests: true,
    },
  });
}
