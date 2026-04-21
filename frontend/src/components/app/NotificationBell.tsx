"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { ApiClientError } from "../../lib/apiShared";
import { getSocketClient } from "../../lib/socketClient";
import { buildWorkspaceDetailHref } from "../../lib/workspaceNavigation";
import type {
  NotificationCreatedEventPayload,
  NotificationItem,
} from "../../types/app";

type NotificationBellProps = {
  initialNotifications: NotificationItem[];
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const sortNotifications = (notifications: NotificationItem[]) =>
  [...notifications].sort((left, right) => {
    if (left.isRead !== right.isRead) {
      return left.isRead ? 1 : -1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

const upsertNotification = (
  notifications: NotificationItem[],
  incomingNotification: NotificationItem,
) => {
  const nextNotifications = notifications.filter(
    (notification) => notification.id !== incomingNotification.id,
  );

  return sortNotifications([incomingNotification, ...nextNotifications]).slice(0, 12);
};

const getUserError = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
};

export function NotificationBell({
  initialNotifications,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState(() =>
    sortNotifications(initialNotifications),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const refreshNotifications = async () => {
    setIsRefreshing(true);
    setErrorMessage("");

    try {
      const latestNotifications = await apiClient<NotificationItem[]>(
        "/api/notifications",
      );
      setNotifications(sortNotifications(latestNotifications));
    } catch (error) {
      setErrorMessage(getUserError(error, "Unable to load notifications."));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (isMarkingRead) {
      return;
    }

    setIsMarkingRead(notificationId);
    setErrorMessage("");

    try {
      const updatedNotification = await apiClient<NotificationItem>(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );

      setNotifications((currentNotifications) =>
        upsertNotification(currentNotifications, updatedNotification),
      );
    } catch (error) {
      setErrorMessage(getUserError(error, "Unable to update notification."));
    } finally {
      setIsMarkingRead(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refreshNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocketClient();

    const handleNotificationCreated = (
      payload: NotificationCreatedEventPayload,
    ) => {
      setNotifications((currentNotifications) =>
        upsertNotification(currentNotifications, payload.notification),
      );
    };

    socket.on("notificationCreated", handleNotificationCreated);

    return () => {
      socket.off("notificationCreated", handleNotificationCreated);
    };
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
        aria-label="Open notifications"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-1 pb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">
                {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshNotifications()}
              disabled={isRefreshing}
              className="text-xs font-medium text-gray-500 transition hover:text-gray-900 disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {notifications.length === 0 ? (
            <div className="px-1 py-8 text-center">
              <p className="text-sm font-medium text-gray-900">No notifications yet</p>
              <p className="mt-1 text-xs text-gray-500">
                New task assignments and comments will appear here.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`rounded-xl border p-3 ${
                    notification.isRead
                      ? "border-gray-200 bg-gray-50/70"
                      : "border-rose-100 bg-rose-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      {notification.message ? (
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {notification.message}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-gray-500">
                        {notification.workspace?.name ?? "Workspace update"} ·{" "}
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    {notification.workspace?.id ? (
                      <Link
                        href={buildWorkspaceDetailHref(notification.workspace.id, "tasks")}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-medium text-blue-600 transition hover:text-blue-500"
                      >
                        Open task view
                      </Link>
                    ) : (
                      <span />
                    )}

                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => void handleMarkRead(notification.id)}
                        disabled={isMarkingRead === notification.id}
                        className="text-xs font-medium text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
                      >
                        {isMarkingRead === notification.id ? "Saving..." : "Mark read"}
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-400">
                        Read
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
