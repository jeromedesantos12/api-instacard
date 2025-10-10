import { Request, Response, NextFunction } from "express";
import { unlink, writeFile } from "fs/promises";
import { resolve } from "path";
import { prisma } from "../connections/prisma";
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
    res.status(200).json({
      status: "Success",
      message: "Fetch users success!",
      data: users,
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
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserByUsername(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { username } = req.params;
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
      where: { username },
    });
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      data: user,
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
  const model = (req as any).model;
  const processedFiles = (req as any).processedFiles || {};
  const oldAvatarName = model?.avatar_url;
  const oldBgImageName = model?.bg_image_url;
  const newAvatarName = processedFiles?.avatar_url.fileName;
  const newBgImageName = processedFiles?.bg_image_url.fileName;
  const newAvatarBuffer = processedFiles?.avatar_url.fileBuffer;
  const newBgImageBuffer = processedFiles?.bg_image_url.fileBuffer;
  const uploadsDir = resolve(process.cwd(), "uploads", "user");
  const oldAvatarPath = oldAvatarName
    ? resolve(uploadsDir, "avatar", oldAvatarName)
    : null;
  const oldBgImagePath = oldBgImageName
    ? resolve(uploadsDir, "image", oldBgImageName)
    : null;
  const newAvatarPath = newAvatarName
    ? resolve(uploadsDir, "avatar", newAvatarName)
    : null;
  const newBgImagePath = newBgImageName
    ? resolve(uploadsDir, "image", newBgImageName)
    : null;
  try {
    const { id } = req.params;
    const {
      remove_avatar,
      remove_bg_image,
      name,
      username,
      bio,
      headline,
      theme_preset,
      accent_color,
      bg_color,
    } = req.body;
    const dataToUpdate: any = {
      username,
      name,
      bio,
      headline,
      theme_preset,
      accent_color,
      bg_color,
    };
    if (newAvatarBuffer && newAvatarPath) {
      await writeFile(newAvatarPath, newAvatarBuffer);
      dataToUpdate.avatar_url = newAvatarName;
    } else if (remove_avatar === "ok") {
      dataToUpdate.avatar_url = null;
    }
    if (newBgImageBuffer && newBgImagePath) {
      await writeFile(newBgImagePath, newBgImageBuffer);
      dataToUpdate.bg_image_url = newBgImageName;
    } else if (remove_bg_image === "ok") {
      dataToUpdate.bg_image_url = null;
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    const filesToDelete: string[] = [];
    if ((remove_avatar === "ok" || newAvatarName) && oldAvatarPath) {
      filesToDelete.push(oldAvatarPath);
    }
    if ((remove_bg_image === "ok" || newBgImageName) && oldBgImagePath) {
      filesToDelete.push(oldBgImagePath);
    }
    await Promise.all(
      filesToDelete.map((file) =>
        unlink(file).catch((err) => {
          if (err.code !== "ENOENT") {
            throw appError("Failed to clean up old file.", 500);
          }
        })
      )
    );
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
      where: { id: updatedUser.id },
    });
    res.status(200).json({
      status: "Success",
      message: "Update user success!",
      data: user,
    });
  } catch (err) {
    const rollbackPaths: string[] = [];
    if (newAvatarPath) rollbackPaths.push(newAvatarPath);
    if (newBgImagePath) rollbackPaths.push(newBgImagePath);
    await Promise.all(
      rollbackPaths.map((file) =>
        unlink(file).catch((err) => {
          if (err.code !== "ENOENT") {
            throw appError("Failed to clean up old file.", 500);
          }
        })
      )
    );
    next(err);
  }
}
