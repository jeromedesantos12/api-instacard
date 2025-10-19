import { Router } from "express";
import { auth, isExistSocial, isSame } from "../middlewares/auth";
import {
  getSocials,
  getSocialsAll,
  putSocial,
  restoreSocial,
  deleteSocial,
  updateSocialOrder,
} from "../controllers/social";
import { validate } from "../middlewares/validate";
import { orderSchema, socialSchema } from "../utils/joi";

const router = Router();

router.get("/active", auth, getSocials);
router.get("/all", auth, getSocialsAll);
router.put("/", auth, validate(socialSchema), putSocial);
router.patch(
  "/:id/reorder",
  auth,
  isExistSocial("socialLink"),
  isSame,
  validate(orderSchema),
  updateSocialOrder
);
router.put("/:id", auth, isExistSocial("socialLink"), isSame, restoreSocial);
router.delete("/:id", auth, isExistSocial("socialLink"), isSame, deleteSocial);

export default router;
