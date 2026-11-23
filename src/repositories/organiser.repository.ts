import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const organiserRepository = {
  findProfileByUserId(userId: string) {
    return prisma.organiserProfile.findFirst({
      where: { userId },
    });
  },

  findProfileById(id: string) {
    return prisma.organiserProfile.findUnique({
      where: { id },
    });
  },

  createProfile(data: Prisma.OrganiserProfileUncheckedCreateInput) {
    return prisma.organiserProfile.create({
      data,
    });
  },

  updateProfile(
    id: string,
    data: Prisma.OrganiserProfileUncheckedUpdateInput,
  ) {
    return prisma.organiserProfile.update({
      where: { id },
      data,
    });
  },

  deleteProfile(id: string) {
    return prisma.organiserProfile.delete({
      where: { id },
    });
  },
};