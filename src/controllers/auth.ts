import { Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import { prisma } from "../connections/prisma";
import { appError } from "../utils/error";
import { signToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { authrizationUrl, oauth2Client } from "../utils/google";

export function googleAuth(req: Request, res: Response, next: NextFunction) {
  res.redirect(authrizationUrl);
}

export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code as string);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  const { data } = await oauth2.userinfo.get();
  if (
    data.email === undefined ||
    data.name === undefined ||
    data.picture === undefined
  ) {
    throw appError("Invalid credentials", 401);
  }
  let user = await prisma.user.findUnique({
    where: {
      email: data.email as string,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: data.name as string,
        username: (data.email as string).split("@")[0] as string,
        email: data.email as string,
        avatar_url: data.picture,
        password: "",
        provider: "GOOGLE",
      },
    });
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
    .redirect("http://localhost:8080/");
}

export async function loginAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        provider: "EMAIL",
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
        message: "Login success!",
      });
  } catch (err) {
    next(err);
  }
}

export function logoutAuth(req: Request, res: Response, next: NextFunction) {
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
        message: "Logout success!",
      });
  } catch (err) {
    next(err);
  }
}

export async function registerAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw appError("Username already taken", 409);
      } else if (existingUser.email === email) {
        throw appError("Email already registered", 409);
      }
    }
    const create = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
    const register = await prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
      where: { id: create.id },
    });

    res.status(201).json({
      status: "Success",
      message: "Register success!",
      data: register,
    });
  } catch (err) {
    next(err);
  }
}

export function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    res.status(200).json({
      status: "Success",
      message: "Verify success!",
      data: {
        id: userId,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetAuth(
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
      message: `Reset password success!`,
    });
  } catch (err) {
    next(err);
  }
}
