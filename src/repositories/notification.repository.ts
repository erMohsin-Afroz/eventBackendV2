import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const notificationRepository = {
  findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  findByEventId(eventId: string) {
    return prisma.notification.findMany({
      where: { eventId },
      orderBy: { timestamp: "desc" },
    });
  },

  findGlobalNotifications() {
    return prisma.notification.findMany({
      where: { eventId: null },
      orderBy: { timestamp: "desc" },
    });
  },

  findMany(where: Prisma.NotificationWhereInput = {}) {
    return prisma.notification.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });
  },

  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({
      data,
    });
  },

  update(
    id: string,
    data: Prisma.NotificationUncheckedUpdateInput,
  ) {
    return prisma.notification.update({
      where: { id },
      data,
    });
  },

  updateMany(
    where: Prisma.NotificationWhereInput,
    data: Prisma.NotificationUpdateManyMutationInput,
  ) {
    return prisma.notification.updateMany({
      where,
      data,
    });
  },

  delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  },

  count(where: Prisma.NotificationWhereInput = {}) {
    return prisma.notification.count({ where });
  },
};