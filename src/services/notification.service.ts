
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface NotificationInput {
  eventId?: string | null;
  title: string;
  message: string;
  isPinned?: boolean;
}

export async function createNotification(
  organiserId: string,
  tenantId: string,
  data: NotificationInput,
) {
  if (data.eventId) {
    const event = await prisma.event.findFirst({
      where: {
        id: data.eventId,
        organiserId,
        tenantId,
      },
    });

    if (!event) {
      throw new AppError("Event not found or access denied", 404);
    }
  }

  return prisma.notification.create({
    data: {
      id: randomUUID(),
      eventId: data.eventId ?? null,
      title: data.title,
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      isPinned: data.isPinned ?? false,
    },
  });
}

export async function getNotifications(eventId?: string) {
  return prisma.notification.findMany({
    where: eventId ? { eventId } : {},
    orderBy: [
      { isPinned: "desc" },
      { timestamp: "desc" },
    ],
  });
}

export async function updateNotification(
  notificationId: string,
  organiserId: string,
  tenantId: string,
  data: {
    isPinned?: boolean;
    title?: string;
    message?: string;
  },
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      event: { organiserId, tenantId },
    },
  });

  if (!notification) {
    throw new AppError("Notification not found or access denied", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data,
  });
}

export async function deleteNotification(
  notificationId: string,
  organiserId: string,
  tenantId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      event: { organiserId, tenantId },
    },
  });

  if (!notification) {
    throw new AppError("Notification not found or access denied", 404);
  }

  return prisma.notification.delete({
    where: { id: notificationId },
  });
}
