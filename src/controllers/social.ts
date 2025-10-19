import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";
import { SocialPlatform } from "@prisma/client";
import { normalizeUsername, buildSocialUrl } from "../utils/social";

export async function getSocials(
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
    const socials = await prisma.socialLink.findMany({
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
    const total = await prisma.socialLink.count({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Fetch socials success!",
      data: socials,
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

export async function getSocialsAll(
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
    const socials = await prisma.socialLink.findMany({
      where: {
        user_id: userId,
      },
      take: limit,
      skip: skip,
      orderBy: {
        [sortField]: order,
      },
    });
    const total = await prisma.socialLink.count({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Fetch socials success!",
      data: socials,
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

export async function putSocial(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { platform, username } = req.body || {};
    if (!platform || !username) {
      return res
        .status(400)
        .json({ message: "Platform and username are required" });
    }

    const p = platform as SocialPlatform;
    const normalized = normalizeUsername(p, String(username));
    const url = buildSocialUrl(p, normalized);

    const saved = await prisma.socialLink.upsert({
      where: { user_id_platform: { user_id: userId, platform: p } },
      update: { username: normalized, url },
      create: { user_id: userId, platform: p, username: normalized, url },
    });

    return res.status(200).json({ data: saved });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Bad Request" });
  }
}

export async function updateSocialOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { order_index } = req.body;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.update({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
      data: {
        order_index,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Update index social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}

export async function restoreSocial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.update({
      where: {
        id,
        user_id: userId,
        is_active: false,
      },
      data: {
        is_active: true,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Restore social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}

export async function softDeleteSocial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.update({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
      data: {
        is_active: false,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Soft Delete social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}

export async function hardDeleteSocial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.delete({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Hard delete social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}
