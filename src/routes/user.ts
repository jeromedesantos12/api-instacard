import { Router } from "express";
import { auth, isSame, isExist } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { saveFiles } from "../middlewares/file";
import { upload } from "../utils/multer";
import { userSchema } from "../utils/joi";
import {
  getUsers,
  getUserById,
  updateUser,
  getUserByUsername,
} from "../controllers/user";

const router = Router();

router.get("/", auth, getUsers);
router.get("/u/:username", getUserByUsername);
router.get("/me/:id", auth, getUserById);
router.patch(
  "/me/:id",
  auth,
  isSame,
  isExist("user"),
  upload.fields([
    { name: "avatar_url", maxCount: 1 },
    { name: "bg_image_url", maxCount: 1 },
  ]),
  validate(userSchema),
  saveFiles,
  updateUser
);

export default router;
