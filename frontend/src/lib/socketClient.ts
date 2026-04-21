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

export const getSocketClient = (): Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
> => {
  if (!socketClient) {
    socketClient = io(browserApiBaseURL, {
      autoConnect: false,
      withCredentials: true,
      tryAllTransports: true,
    });
  }

  return socketClient;
};

export const disconnectSocketClient = () => {
  socketClient?.disconnect();
};
