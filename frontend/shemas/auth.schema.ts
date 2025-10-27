import z from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;

export const LoginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (v) => emailRegex.test(v) || usernameRegex.test(v),
      "Enter a valid email or a username"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
});

export type LoginValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    full_name: z.string().min(3, "Full name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscore"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterValues = z.infer<typeof RegisterSchema>;
