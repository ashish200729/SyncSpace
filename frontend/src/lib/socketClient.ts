"use client";

import { io, type Socket } from "socket.io-client";
import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "../types/app";
import { browserApiBaseURL } from "./apiBaseUrl";

let socketClient: Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
> | null = null;

const explicitRealtimeSetting = process.env.NEXT_PUBLIC_ENABLE_REALTIME?.trim();

export const isRealtimeEnabled =
  explicitRealtimeSetting === "true"
    ? true
    : explicitRealtimeSetting === "false"
      ? false
      : !browserApiBaseURL.includes(".vercel.app");

export const getSocketClient = (): Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
> => {
  if (!isRealtimeEnabled) {
    throw new Error("Realtime is disabled for this deployment.");
  }

  if (!socketClient) {
    socketClient = io(browserApiBaseURL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"], // Disable WebTransport to prevent handshake errors in some environments
      tryAllTransports: true,
    });
  }

  return socketClient;
};

export const disconnectSocketClient = () => {
  socketClient?.disconnect();
};
