import { Router } from "express";
import { auth, isExistSocial, isSame } from "../middlewares/auth";
import {
  getSocials,
  putSocial,
  restoreSocial,
  deleteSocial,
  updateSocialOrder,
} from "../controllers/social";
import { validate } from "../middlewares/validate";
import { orderSchema, socialSchema } from "../utils/joi";

const router = Router();

router.get("/", auth, getSocials);
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
