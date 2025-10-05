import { Router } from "express";
import {
  auth,
  isExist,
  isExistUserId,
  isSameUserId,
} from "../middlewares/auth";
import {
  deleteLink,
  getLinkById,
  getLinks,
  postLink,
  updateLink,
  updateLinkOrder,
} from "../controllers/link";
import { validate } from "../middlewares/validate";
import { orderSchema, linkSchema } from "../utils/joi";

const router = Router();

router.get("/", auth, getLinks);
router.get("/:id", auth, getLinkById);
router.post("/", auth, validate(linkSchema), postLink);
router.patch(
  "/:id",
  auth,
  isExistUserId("link"),
  isSameUserId,
  validate(linkSchema),
  updateLink
);
router.patch(
  "/:id/reorder",
  auth,
  isExistUserId("link"),
  isSameUserId,
  validate(orderSchema),
  updateLinkOrder
);
router.delete("/:id", auth, isExistUserId("link"), isSameUserId, deleteLink);

export default router;
