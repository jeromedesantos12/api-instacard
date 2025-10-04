import { Router } from "express";
import { auth, isSame, isExist } from "../middlewares/auth";
import { upload } from "../utils/multer";
import { validate } from "../middlewares/validate";
import { saveFile } from "../middlewares/file";
import { userSchema } from "../utils/joi";
import { getUsers, getUserById, updateUser } from "../controllers/user";
import { config } from "dotenv";

config();

const router = Router();

router.get("/", auth, getUsers);
router.get("/:id", auth, getUserById);
router.put(
  "/:id",
  auth,
  isSame,
  isExist("user"),
  upload.single("photo_profile"),
  validate(userSchema),
  saveFile,
  updateUser
);

export default router;
