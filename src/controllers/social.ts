import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";

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

export async function getSocialById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.findUnique({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Fetch social success!",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}

export async function postSocial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { platform, handle, url } = req.body;
    const userId = (req as any).user.id;
    const maxOrder = await prisma.socialLink.aggregate({
      _max: {
        order_index: true,
      },
      where: {
        user_id: userId,
      },
    });
    const newOrderIndex = (maxOrder._max.order_index ?? -1) + 1;
    const social = await prisma.socialLink.create({
      data: {
        platform,
        handle,
        url,
        order_index: newOrderIndex,
        is_active: true,
        user_id: userId,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Create social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSocial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { platform, handle, url } = req.body;
    const userId = (req as any).user.id;
    const social = await prisma.socialLink.update({
      where: {
        id,
        user_id: userId,
        is_active: true,
      },
      data: {
        platform,
        handle,
        url,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Update link success",
      data: social,
    });
  } catch (err) {
    next(err);
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

export async function deleteSocial(
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
      message: "Delete social success",
      data: social,
    });
  } catch (err) {
    next(err);
  }
}
