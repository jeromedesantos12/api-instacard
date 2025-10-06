import { Router } from "express";
import { auth, isExistSocial, isSameBody } from "../middlewares/auth";
import {
  deleteSocial,
  getSocialById,
  getSocials,
  postSocial,
  restoreSocial,
  updateSocial,
  updateSocialOrder,
} from "../controllers/social";
import { validate } from "../middlewares/validate";
import { orderSchema, socialSchema } from "../utils/joi";

const router = Router();

router.get("/", auth, getSocials);
router.get("/:id", auth, getSocialById);
router.post("/", auth, validate(socialSchema), postSocial);
router.patch("/:id", auth, isExistSocial("social"), isSameBody, updateSocial);
router.patch(
  "/:id/reorder",
  auth,
  isExistSocial("social"),
  isSameBody,
  validate(orderSchema),
  updateSocialOrder
);
router.put("/:id", auth, isExistSocial("social"), isSameBody, restoreSocial);
router.delete("/:id", auth, isExistSocial("social"), isSameBody, deleteSocial);

export default router;
