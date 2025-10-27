import { Router } from "express";
import { auth, isExistLink, isSame } from "../middlewares/auth";
import {
  deleteLink,
  getLinks,
  postLink,
  updateLink,
  updateLinkOrder,
} from "../controllers/link";
import { validate } from "../middlewares/validate";
import { orderSchema, linkSchema } from "../utils/joi";

const router = Router();

router.get("/", auth, getLinks);
router.post("/", auth, validate(linkSchema), postLink);
router.patch(
  "/:id",
  auth,
  isExistLink("link"),
  isSame,
  validate(linkSchema),
  updateLink
);
router.patch(
  "/:id/reorder",
  auth,
  isExistLink("link"),
  isSame,
  validate(orderSchema),
  updateLinkOrder
);
router.delete("/:id", auth, isExistLink("link"), isSame, deleteLink);

export default router;
