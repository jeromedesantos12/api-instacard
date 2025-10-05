import { Request, Response, NextFunction } from "express";
import { appError } from "../utils/error";

export function home(req: Request, res: Response, next: NextFunction) {
  try {
    throw appError("Route Not Found!", 404);
  } catch (err) {
    next(err);
  }
}
