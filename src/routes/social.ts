import { Router } from "express";
import { auth, isSame } from "../middlewares/auth";
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
router.patch("/:id", auth, isSame, validate(socialSchema), updateSocial);
router.patch(
  "/:id/reorder",
  auth,
  isSame,
  validate(orderSchema),
  updateSocialOrder
);
router.delete("/:id", auth, isSame, deleteSocial);

export default router;
