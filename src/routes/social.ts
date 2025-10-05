import { Router } from "express";
import {
  auth,
  isExist,
  isExistUserId,
  isSameUserId,
} from "../middlewares/auth";
import {
  deleteSocial,
  getSocialById,
  getSocials,
  postSocial,
  updateSocial,
  updateSocialOrder,
} from "../controllers/social";
import { config } from "dotenv";
import { validate } from "../middlewares/validate";
import { orderSchema, socialSchema } from "../utils/joi";

config();

const router = Router();

router.get("/", auth, getSocials);
router.get("/:id", auth, getSocialById);
router.post("/", auth, validate(socialSchema), postSocial);
router.patch("/:id", auth, isExistUserId("social"), isSameUserId, updateSocial);
router.patch(
  "/:id/reorder",
  auth,
  isExistUserId("social"),
  isSameUserId,
  validate(orderSchema),
  updateSocialOrder
);
router.delete(
  "/:id",
  auth,
  isExistUserId("social"),
  isSameUserId,
  deleteSocial
);

export default router;
