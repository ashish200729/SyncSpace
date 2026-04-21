"use client";

import { useEffect } from "react";
import { getSocketClient } from "../../lib/socketClient";

export function AppSocketConnection() {
  useEffect(() => {
    const socket = getSocketClient();

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}
