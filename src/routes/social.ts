import { Router } from "express";
import { auth, isExistSocial, isSame } from "../middlewares/auth";
import {
  getSocials,
  postSocial,
  restoreSocial,
  updateSocial,
  deleteSocial,
  updateSocialOrder,
} from "../controllers/social";
import { validate } from "../middlewares/validate";
import { orderSchema, socialSchema } from "../utils/joi";

const router = Router();

router.get("/", auth, getSocials);
router.post("/", auth, validate(socialSchema), postSocial);
router.patch("/:id", auth, isExistSocial("social"), isSame, updateSocial);
router.patch(
  "/:id/reorder",
  auth,
  isExistSocial("social"),
  isSame,
  validate(orderSchema),
  updateSocialOrder
);
router.put("/:id", auth, isExistSocial("social"), isSame, restoreSocial);
router.delete("/:id", auth, isExistSocial("social"), isSame, deleteSocial);

export default router;
