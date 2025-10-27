import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";

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
      },
    });
    res.status(200).json({
      status: "success",
      message: "Fetch links success!",
      data: links,
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

export async function postLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, url } = req.body;
    const userId = (req as any).user.id;
    const maxOrder = await prisma.link.aggregate({
      _max: {
        order_index: true,
      },
      where: {
        user_id: userId,
      },
    });
    const newOrderIndex = (maxOrder._max.order_index ?? -1) + 1;
    const link = await prisma.link.create({
      data: {
        title,
        url,
        order_index: newOrderIndex,
        user_id: userId,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Create link success",
      data: link,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, url } = req.body;
    const userId = (req as any).user.id;
    const link = await prisma.link.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        title,
        url,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Update link success",
      data: link,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateLinkOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { order_index } = req.body;
    const userId = (req as any).user.id;
    const link = await prisma.link.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        order_index,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Update index link success",
      data: link,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const link = await prisma.link.delete({
      where: {
        id,
        user_id: userId,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Delete link success",
      data: link,
    });
  } catch (err) {
    next(err);
  }
}
