import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  createUser(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({
      data,
    });
  },

  updateUser(
    id: string,
    data: Prisma.UserUncheckedUpdateInput,
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};