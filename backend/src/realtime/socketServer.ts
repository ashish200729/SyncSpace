import type { IncomingHttpHeaders, Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import prisma from "../config/prisma.js";
import { appConfig } from "../config/env.js";
import { readAuthSession } from "../middleware/authSession.js";
import { getUserRoom, getWorkspaceRoom, socketEvents } from "./socketEvents.js";

let io: Server | null = null;

type WorkspaceJoinAck = (response: { ok: boolean; message?: string }) => void;

export const initializeSocketServer = (httpServer: HttpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: appConfig.trustedOrigins,
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const session = await readAuthSession(
        socket.handshake.headers as IncomingHttpHeaders,
      );

      if (!session) {
        next(new Error("Unauthorized"));
        return;
      }

      socket.data.auth = session;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const session = socket.data.auth as
      | {
          user?: {
            id?: string;
          };
        }
      | undefined;

    const currentUserId = session?.user?.id;
    if (currentUserId) {
      socket.join(getUserRoom(currentUserId));
    }

    socket.on(
      socketEvents.workspaceJoin,
      async (workspaceId: string, acknowledge?: WorkspaceJoinAck) => {
        if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
          acknowledge?.({
            ok: false,
            message: "A valid workspace identifier is required.",
          });
          return;
        }

        if (!currentUserId) {
          acknowledge?.({
            ok: false,
            message: "Authentication is required.",
          });
          return;
        }

        const membership = await prisma.workspaceMember.findFirst({
          where: {
            workspaceId,
            userId: currentUserId,
            leftAt: null,
          },
          select: {
            id: true,
          },
        });

        if (!membership) {
          acknowledge?.({
            ok: false,
            message: "You do not have access to this workspace.",
          });
          return;
        }

        socket.join(getWorkspaceRoom(workspaceId));
        acknowledge?.({
          ok: true,
        });
      },
    );
  });

  return io;
};

export const emitWorkspaceEvent = (
  workspaceId: string,
  eventName: string,
  payload: unknown,
) => {
  io?.to(getWorkspaceRoom(workspaceId)).emit(eventName, payload);
};
