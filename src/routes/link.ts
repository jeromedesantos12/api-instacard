import { Router } from "express";
import { auth, isSame, isExist } from "../middlewares/auth";
// import { upload } from "../utils/multer";
// import { validate } from "../middlewares/validate";
// import { saveFile } from "../middlewares/file";
// import { linkSchema } from "../utils/joi";
import { getLinks } from "../controllers/link";
import { config } from "dotenv";

config();

const router = Router();

router.get("/", auth, getLinks);
// router.get("/:id", auth, getLinkById);
// router.put(
//   "/:id",
//   auth,
//   isSame,
//   isExist("user"),
//   upload.single("photo_profile"),
//   validate(linkSchema),
//   saveFile,
//   updateLink
// );

export default router;
