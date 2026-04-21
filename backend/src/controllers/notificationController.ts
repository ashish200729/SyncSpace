import type { RequestHandler } from "express";
import { getAuthSession } from "../middleware/authSession.js";
import type { ApiSuccessResponse } from "../types/api.js";
import {
  listNotifications,
  markNotificationAsRead,
} from "../services/notificationService.js";

export const listNotificationsController: RequestHandler = async (_req, res) => {
  const session = getAuthSession(res);
  const notifications = await listNotifications(session.user.id);
  const payload: ApiSuccessResponse<typeof notifications> = {
    data: notifications,
  };
  res.status(200).json(payload);
};

export const markNotificationAsReadController: RequestHandler = async (
  req,
  res,
) => {
  const session = getAuthSession(res);
  const notification = await markNotificationAsRead(
    req.params.notificationId,
    session.user.id,
  );
  const payload: ApiSuccessResponse<typeof notification> = {
    data: notification,
  };
  res.status(200).json(payload);
};
