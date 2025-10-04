import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must not be empty.",
    "any.required": "Name is required.",
  }),
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]{3,30}$/)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "Username must be 3-30 alphanumeric characters or underscores.",
    }),
  remove: Joi.string().optional(),
  email: Joi.string().optional(),
  password: Joi.string().optional(),
  avatar_url: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Invalid avatar URL.",
  }),
  bg_image_url: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Invalid image URL.",
  }),
  bio: Joi.string().max(500).allow(null, "").optional().messages({
    "string.max": "Bio cannot exceed 500 characters.",
  }),
});

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.base": "Name should be a type of text",
      "string.empty": "Name cannot be an empty field",
      "string.min": "Name should have a minimum length of {#limit}",
      "string.max": "Name should have a maximum length of {#limit}",
      "string.pattern.base": "Name can only contain letters and spaces",
      "any.required": "Name is a required field",
    }),
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]{3,30}$/)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "Username must be 3-30 alphanumeric characters or underscores.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email address",
      "any.required": "Email is a required field",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is a required field",
  }),
});

export const resetSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is a required field",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New Password must be at least 6 characters",
    "any.required": "New Password is a required field",
  }),
});
