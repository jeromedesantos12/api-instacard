import { Router } from "express";
import {
  auth,
  isExistSocial,
  isExistSocialHard,
  isExistSocialRestore,
  isSame,
} from "../middlewares/auth";
import {
  getSocials,
  getSocialsAll,
  putSocial,
  restoreSocial,
  softDeleteSocial,
  hardDeleteSocial,
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
router.put(
  "/:id",
  auth,
  isExistSocialRestore("socialLink"),
  isSame,
  restoreSocial
);
router.delete(
  "/soft/:id",
  auth,
  isExistSocial("socialLink"),
  isSame,
  softDeleteSocial
);
router.delete(
  "/hard/:id",
  auth,
  isExistSocialHard("socialLink"),
  isSame,
  hardDeleteSocial
);

export default router;
