import { Request, Response, NextFunction } from "express";
import { unlink as unlinkAsync } from "fs/promises";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "../connections/prisma";
import { redis } from "../connections/redis";
import { appError } from "../utils/error";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort === "order" ? "order_index" : "created_at";
    const order =
      (req.query.order as string)?.toLowerCase() === "desc" ? "desc" : "asc";
    const userId = (req as any).user.id;
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        {
          username: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          full_name: {
            contains: search as string,
            mode: "insensitive",
          },
        },
      ];
    }
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar_url: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        [sortField]: order,
      },
    });
    const total = await prisma.user.count({
      where: {
        id: userId,
      },
    });
    let results = null;
    const key = "getUsers:" + search;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
    } else {
      results = users;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch users success!",
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

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar_url: true,
        bio: true,
        headline: true,
        theme_preset: true,
        bg_color: true,
        bg_image_url: true,
        created_at: true,
        updated_at: true,
      },
      where: { id },
    });
    let results = null;
    const key = "getUserById:" + id;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
    } else {
      results = user;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const {
      remove_avatar,
      remove_bg,
      name,
      username,
      bio,
      headline,
      theme_preset,
      accent_color,
      bg_color,
    } = req.body;
    const existingUser = (req as any).model;
    const newAvatar = (req as any)?.processedFiles?.avatar_url;
    const newBgImage = (req as any)?.processedFiles?.bg_image_url;
    const uploadsDir = resolve(process.cwd(), "uploads");
    const oldAvatarPath = existingUser.avatar_url
      ? resolve(uploadsDir, existingUser.avatar_url)
      : null;
    const oldBgImagePath = existingUser.bg_image_url
      ? resolve(uploadsDir, existingUser.bg_image_url)
      : null;
    const dataToUpdate: any = {
      username,
      name,
      bio,
      headline,
      theme_preset,
      accent_color,
      bg_color,
    };
    if (remove_avatar === "ok") {
      dataToUpdate.avatar_url = null;
    } else if (newAvatar) {
      dataToUpdate.avatar_url = `user/avatar/${newAvatar.fileName}`;
    }
    if (remove_bg === "ok") {
      dataToUpdate.bg_image_url = null;
    } else if (newBgImage) {
      dataToUpdate.bg_image_url = `user/image/${newBgImage.fileName}`;
    }
    await prisma.user.update({
      data: dataToUpdate,
      where: { id },
    });
    const filesToDelete = [];
    if ((remove_avatar === "ok" || newAvatar) && oldAvatarPath) {
      filesToDelete.push(oldAvatarPath);
    }
    if ((remove_bg === "ok" || newBgImage) && oldBgImagePath) {
      filesToDelete.push(oldBgImagePath);
    }
    await Promise.all(
      filesToDelete.map((path) =>
        unlinkAsync(path).catch((err) => {
          if (err.code !== "ENOENT") {
            throw appError("Failed to clean up old file.", 500);
          }
        })
      )
    );
    if (newAvatar) {
      const newPath = resolve(uploadsDir, "user", "avatar", newAvatar.fileName);
      writeFileSync(newPath, newAvatar.fileBuffer);
    }
    if (newBgImage) {
      const newPath = resolve(uploadsDir, "user", "image", newBgImage.fileName);
      writeFileSync(newPath, newBgImage.fileBuffer);
    }
    res.status(200).json({
      status: "Success",
      message: `Update user ${name} success!`,
    });
  } catch (err) {
    next(err);
  }
}
