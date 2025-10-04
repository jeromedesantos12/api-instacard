import { Request, Response, NextFunction } from "express";
import { prisma } from "../connections/prisma";
import { appError } from "../utils/error";
import { signToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/bcrypt";

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
    if (user === null) {
      throw appError("Invalid email or username", 401);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (user && isPasswordValid === false) {
      throw appError("Invalid password", 401);
    }
    const token = signToken({
      id: user.id,
      username: user.username,
    });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: `Login User by: ${emailOrUsername} success!`,
      });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: `Login User by: ${emailOrUsername} success!`,
      });
  } catch (err) {
    next(err);
  }
}

export function logoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        status: "Success",
        message: "Logout successful!",
      });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const exitingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (exitingEmail) {
      throw appError("Email already exists!", 409);
    }
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({
      status: "Success",
      message: `Create user ${name} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = (req as any).user;
    res.status(200).json({
      status: "Success",
      message: "Fetch user success!",
      data: {
        id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const existingUser = (req as any).model;
    const isPasswordValid = await comparePassword(
      password,
      existingUser.password
    );
    if (existingUser && isPasswordValid === false) {
      throw appError("Invalid password", 401);
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id },
    });
    res.status(200).json({
      status: "Success",
      message: `Reset user by id: ${id} success!`,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      select: {
        password: true,
      },
      where: { email },
    });
    res.status(200).json({
      status: "Success",
      message: `Fetch user success!`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
