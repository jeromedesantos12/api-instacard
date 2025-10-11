import { Request, Response, NextFunction } from "express";
import { unlink, writeFile } from "fs/promises";
import { resolve } from "path";
import { prisma } from "../connections/prisma";
import { appError } from "../utils/error";
import {
  genAI,
  generateBioPrompt as aiGenerateBioPrompt,
  MODEL_NAME,
} from "../connections/gen-ai";

export async function generateBio(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { bio } = req.body;
  const promptString = aiGenerateBioPrompt(bio);
  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: promptString }],
        },
      ],
    });
    res.status(200).json({
      status: "Success",
      message: "Fetch AI success!",
      data: response.text,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = (req as any).user;
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar_url: true,
        bio: true,
        theme: true,
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
        theme: true,
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
  const newAvatarName = processedFiles?.avatar_url?.fileName;
  const newAvatarBuffer = processedFiles?.avatar_url?.fileBuffer;
  const uploadsDir = resolve(process.cwd(), "uploads", "user");
  const oldAvatarPath = oldAvatarName
    ? resolve(uploadsDir, "avatar", oldAvatarName)
    : null;
  const newAvatarPath = newAvatarName
    ? resolve(uploadsDir, "avatar", newAvatarName)
    : null;
  try {
    const { id } = (req as any).user;
    const { name, bio, theme } = req.body;
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (bio) dataToUpdate.bio = bio;
    if (theme) dataToUpdate.theme = theme;
    if (newAvatarBuffer && newAvatarPath) {
      await writeFile(newAvatarPath, newAvatarBuffer);
      dataToUpdate.avatar_url = newAvatarName;
    } else {
      dataToUpdate.avatar_url = oldAvatarName;
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    const filesToDelete: string[] = [];
    if (newAvatarName && oldAvatarPath) {
      filesToDelete.push(oldAvatarPath);
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
        theme: true,
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
