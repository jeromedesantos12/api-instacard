import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import { appError } from "../utils/error";

export async function getLinks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort === "order" ? "order_index" : "created_at";
    const order =
      (req.query.order as string)?.toLowerCase() === "desc" ? "desc" : "asc";
    const userId = (req as any).user.id;
    const links = await prisma.link.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        [sortField]: order,
      },
    });
    const total = await prisma.link.count({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
    let results = null;
    const key = "getLinks";
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
    } else {
      results = links;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
    }
    res.status(200).json({
      status: "success",
      message: "Links fetched",
      data: results,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLinkById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const link = await prisma.link.findUnique({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
    });
    if (!link) {
      throw appError("Link not found", 404);
    }
    let results = null;
    const key = "getLinks";
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
    } else {
      results = link;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
    }
    res.status(200).json({
      status: "success",
      message: "Link fetched",
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export function postLink(req: Request, res: Response, next: NextFunction) {}

export function updateLink(req: Request, res: Response, next: NextFunction) {}
export function deleteLink(req: Request, res: Response, next: NextFunction) {}
