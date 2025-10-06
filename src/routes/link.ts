import { Router } from "express";
import { auth, isExistLink, isSameBody } from "../middlewares/auth";
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
  isExistLink("link"),
  isSameBody,
  validate(linkSchema),
  updateLink
);
router.patch(
  "/:id/reorder",
  auth,
  isExistLink("link"),
  isSameBody,
  validate(orderSchema),
  updateLinkOrder
);
router.delete("/:id", auth, isExistLink("link"), isSameBody, deleteLink);

export default router;
