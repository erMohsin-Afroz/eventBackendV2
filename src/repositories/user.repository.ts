import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findMany(where: Prisma.UserWhereInput = {}) {
    return prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.UserUncheckedUpdateInput,
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};