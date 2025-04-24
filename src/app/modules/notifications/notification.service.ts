
import admin from "../../config/firebaseAdmin";
import prisma from "../../config/prisma";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interface/pagination.type";

// Send notification to a single user
const sendSingleNotification = async (req: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });

  if (!user?.fcmToken) {
    throw new ApiError(404, "User not found with FCM token");
  }

  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    token: user.fcmToken,
  };

  await prisma.notification.create({
    data: {
      receiverId: req.params.userId,
      senderId: req.user.id,
      title: req.body.title,
      body: req.body.body,
    },
  });

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error: any) {
    if (error.code === "messaging/invalid-registration-token") {
      throw new ApiError(400, "Invalid FCM registration token");
    } else if (error.code === "messaging/registration-token-not-registered") {
      throw new ApiError(404, "FCM token is no longer registered");
    } else {
      throw new ApiError(500, "Failed to send notification");
    }
  }
};

// Send notifications to all users with valid FCM tokens
const sendNotifications = async (senderId: string, req: any) => {
  const users = await prisma.user.findMany({
    where: {
      fcmToken: {},
    },
    select: {
      id: true,
      fcmToken: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found with FCM tokens");
  }

  const fcmTokens = users.map((user) => user.fcmToken);

  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    tokens: fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message as any);

  // Find indices of successful responses
  const successIndices = response.responses
    .map((res, idx) => (res.success ? idx : null))
    .filter((idx) => idx !== null) as number[];

  // Filter users by success indices
  const successfulUsers = successIndices.map((idx) => users[idx]);

  // Prepare notifications data for only successfully notified users
  const notificationData = successfulUsers.map((user) => ({
    senderId: senderId,
    receiverId: user.id,
    title: req.body.title,
    body: req.body.body,
  }));

  // Save notifications only if there is data
  if (notificationData.length > 0) {
    await prisma.notification.createMany({
      data: notificationData,
    });
  }

  // Collect failed tokens
  const failedTokens = response.responses
    .map((res, idx) => (!res.success ? fcmTokens[idx] : null))
    .filter((token) => token !== null);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
  };
};
const getNotificationsFromDB = async (
  userId: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: userId,
    },
    select: {
      id: true,
      title: true,
      body: true,
      senderId: true,
      createdAt: true,
      // user: {
      //   select: {
      //     name: true,
      //     profileImage: true,
      //   },
      // },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  return {
    meta: {
      page,
      limit,
      total: notifications.length,
      totalPage: Math.ceil(notifications.length / limit),
    },
    data: notifications,
  };
};

const getSingleNotificationFromDB = async (
  req: any,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      receiverId: req.user.id,
    },
  });

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
    select: {
      id: true,
      title: true,
      body: true,
      senderId: true,
      createdAt: true,
      // user: {
      //   select: {
      //     name: true,
      //     profileImage: true,
      //   },
      // },
    },
  });

  return updatedNotification;
};

export const notificationServices = {
  sendSingleNotification,
  sendNotifications,
  getNotificationsFromDB,
  getSingleNotificationFromDB,
};
