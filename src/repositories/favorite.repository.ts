import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const favoriteRepository = {
  findById(id: string) {
    return prisma.favorite.findUnique({
      where: { id },
    });
  },

  findByUserAndItem(
    userId: string,
    itemType: string,
    itemId: string,
  ) {
    return prisma.favorite.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    });
  },

  findByUserId(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });
  },

  create(data: Prisma.FavoriteUncheckedCreateInput) {
    return prisma.favorite.create({
      data,
    });
  },

  deleteByUserAndItem(
    userId: string,
    itemType: string,
    itemId: string,
  ) {
    return prisma.favorite.deleteMany({
      where: {
        userId,
        itemType,
        itemId,
      },
    });
  },

  delete(id: string) {
    return prisma.favorite.delete({
      where: { id },
    });
  },

  count(where: Prisma.FavoriteWhereInput = {}) {
    return prisma.favorite.count({ where });
  },
};