import { Request, Response, NextFunction } from "express";
import { unlink, writeFileSync } from "fs";
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
    const {
      search,
      sortBy = "created_at",
      order = "desc",
      offset = 0,
      limit = 10,
    } = req.query;
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
      orderBy: {
        [sortBy as string]: order as "asc" | "desc",
      },
      skip: Number(offset),
      take: Number(limit),
    });
    let results = null;
    const key = "getUsers:" + search;
    const value = await redis.get(key);
    if (value) {
      results = JSON.parse(value);
      console.log("Catche hit");
    } else {
      results = users;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch users success!",
      // data: results,
      data: users,
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
      console.log("Catche hit");
    } else {
      results = user;
      await redis.set(key, JSON.stringify(results), {
        EX: 300,
      });
      console.log("Catche miss");
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      // data: results,
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
  try {
    const { id } = req.params;
    const { remove, name, username, bio } = req.body;
    const existingUser = (req as any).model;
    const fileName = (req as any)?.processedFile?.fileName;
    const fileBuffer = (req as any)?.processedFile?.fileBuffer;
    const relativePath = fileName ? `user/${fileName}` : null;
    await prisma.user.update({
      data: {
        username,
        name,
        email: existingUser.email,
        password: existingUser.password,
        avatar_url:
          remove === "ok" ? null : relativePath ?? existingUser.avatar_url,
        bio,
      },
      where: { id },
    });
    const user = await prisma.user.findUnique({
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
      where: { id },
    });
    const uploadsDir = resolve(process.cwd(), "uploads");
    const oldFilePath = existingUser.avatar_url
      ? resolve(uploadsDir, existingUser.avatar_url)
      : null;
    const newFilePath = fileName ? resolve(uploadsDir, "user", fileName) : null;
    if (remove === "ok" && oldFilePath) {
      unlink(oldFilePath, (err) => {
        if (err) throw appError("File cannot remove!", 500);
      });
    }
    if (fileName && fileBuffer) {
      if (oldFilePath) {
        unlink(oldFilePath, (err) => {
          if (err) throw appError("File cannot remove!", 500);
        });
      }
      writeFileSync(newFilePath!, fileBuffer);
    }
    res.status(200).json({
      status: "Success",
      message: `Update user ${name} success!`,
    });
  } catch (err) {
    next(err);
  }
}
