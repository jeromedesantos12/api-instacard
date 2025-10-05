import { Request, Response, NextFunction } from "express";

const version = process.env.API_VERSION;

export function notFound(req: Request, res: Response, next: NextFunction) {
  try {
    res.send(`API version ${version}`);
  } catch (err) {
    next(err);
  }
}
