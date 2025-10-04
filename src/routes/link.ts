import { Router } from "express";
import { auth, isSame } from "../middlewares/auth";
import {
  deleteLink,
  getLinkById,
  getLinks,
  updateLink,
  updateLinkOrder,
} from "../controllers/link";
import { config } from "dotenv";
import { validate } from "../middlewares/validate";
import { orderSchema, linkSchema } from "../utils/joi";

config();

const router = Router();

router.get("/", auth, getLinks);
router.get("/:id", auth, getLinkById);
router.patch("/:id", auth, isSame, validate(linkSchema), updateLink);
router.patch(
  "/:id/reorder",
  auth,
  isSame,
  validate(orderSchema),
  updateLinkOrder
);
router.delete("/:id", auth, isSame, deleteLink);

export default router;
