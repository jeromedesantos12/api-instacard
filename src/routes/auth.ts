import { Router } from "express";
import { auth, nonAuth, isExist } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { registerSchema, resetSchema } from "../utils/joi";
import {
  googleAuth,
  googleCallback,
  loginAuth,
  logoutAuth,
  registerAuth,
  resetAuth,
  verifyAuth,
} from "../controllers/auth";

const router = Router();

router.post("/login", nonAuth, loginAuth);
router.post("/register", nonAuth, validate(registerSchema), registerAuth);
router.post("/logout", auth, logoutAuth);
router.put(
  "/reset/:id",
  nonAuth,
  isExist("user"),
  validate(resetSchema),
  resetAuth
);
router.get("/verify", auth, verifyAuth);
router.get("/google", nonAuth, googleAuth);
router.get("/google/callback", nonAuth, googleCallback);

export default router;
