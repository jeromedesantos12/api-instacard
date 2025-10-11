import { Router } from "express";
import { auth, isSame, isExist } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { saveFiles } from "../middlewares/file";
import { upload } from "../utils/multer";
import { userSchema } from "../utils/joi";
import {
  getUser,
  updateUser,
  getUserByUsername,
  generateBio,
} from "../controllers/user";

const router = Router();

router.get("/u/:username", getUserByUsername);
router.get("/me", auth, getUser);
router.post("/bio", auth, generateBio);
router.patch(
  "/me",
  auth,
  isSame,
  isExist("user"),
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  validate(userSchema),
  saveFiles,
  updateUser
);

export default router;
