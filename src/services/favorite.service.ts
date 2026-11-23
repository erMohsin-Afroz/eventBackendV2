
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

type FavoriteItemType = "event" | "session" | "speaker";

async function verifyFavoriteItem(
  itemType: FavoriteItemType,
  itemId: string,
  tenantId: string,
) {
  if (itemType === "event") {
    const item = await prisma.event.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) throw new AppError("Event not found", 404);
  }

  if (itemType === "session") {
    const item = await prisma.session.findFirst({
      where: {
        id: itemId,
        event: { tenantId },
      },
    });

    if (!item) throw new AppError("Session not found", 404);
  }

  if (itemType === "speaker") {
    const item = await prisma.speaker.findFirst({
      where: {
        id: itemId,
        event: { tenantId },
      },
    });

    if (!item) throw new AppError("Speaker not found", 404);
  }
}

export async function addFavorite(
  userId: string,
  tenantId: string,
  itemType: FavoriteItemType,
  itemId: string,
) {
  await verifyFavoriteItem(itemType, itemId, tenantId);

  const existing = await prisma.favorite.findFirst({
    where: { userId, itemType, itemId },
  });

  if (existing) {
    return existing;
  }

  return prisma.favorite.create({
    data: {
      id: randomUUID(),
      userId,
      itemType,
      itemId,
      addedAt: new Date(),
    },
  });
}

export async function getUserFavorites(
  userId: string,
  itemType?: FavoriteItemType,
) {
  return prisma.favorite.findMany({
    where: {
      userId,
      ...(itemType ? { itemType } : {}),
    },
    orderBy: { addedAt: "desc" },
  });
}

export async function removeFavorite(
  userId: string,
  itemType: FavoriteItemType,
  itemId: string,
) {
  const favorite = await prisma.favorite.findFirst({
    where: { userId, itemType, itemId },
  });

  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  await prisma.favorite.delete({
    where: { id: favorite.id },
  });

  return { success: true };
}
