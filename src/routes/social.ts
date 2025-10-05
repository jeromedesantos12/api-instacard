import { Router } from "express";
import { auth, isSameReq } from "../middlewares/auth";
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
router.patch("/:id", auth, isSameReq, validate(socialSchema), updateSocial);
router.patch(
  "/:id/reorder",
  auth,
  isSameReq,
  validate(orderSchema),
  updateSocialOrder
);
router.delete("/:id", auth, isSameReq, deleteSocial);

export default router;
