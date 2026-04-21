import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validateRequest = ({
  body,
  params,
  query,
}: ValidationSchemas): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params) as typeof req.params;
      }

      if (query) {
        req.query = query.parse(req.query) as typeof req.query;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
