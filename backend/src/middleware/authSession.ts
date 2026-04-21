import type { IncomingHttpHeaders } from "node:http";
import type { RequestHandler, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { ApiError } from "../errors/apiError.js";

const getAuthHeaders = (headers: Headers | IncomingHttpHeaders): Headers => {
  if (headers instanceof Headers) {
    return headers;
  }

  return fromNodeHeaders(headers);
};

export const readAuthSession = async (
  headers: Headers | IncomingHttpHeaders,
) => {
  return auth.api.getSession({
    headers: getAuthHeaders(headers),
    query: {
      disableRefresh: true,
    },
  });
};

export type AuthenticatedSession = NonNullable<
  Awaited<ReturnType<typeof readAuthSession>>
>;

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await readAuthSession(req.headers);

    if (!session) {
      next(ApiError.unauthorized());
      return;
    }

    res.locals.auth = session;
    next();
  } catch (error) {
    next(error);
  }
};

export const getAuthSession = (res: Response): AuthenticatedSession => {
  const session = (res.locals as { auth?: AuthenticatedSession }).auth;

  if (!session) {
    throw ApiError.unauthorized();
  }

  return session;
};
