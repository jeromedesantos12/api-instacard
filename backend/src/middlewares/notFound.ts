import { Request, Response, NextFunction } from "express";

const version = process.env.API_VERSION;

export function notFound(req: Request, res: Response, next: NextFunction) {
  try {
    throw appError("Route Not Found!", 404);
  } catch (err) {
    next(err);
  }
}
