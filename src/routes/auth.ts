import { Router } from "express";
import { auth, nonAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { registerSchema } from "../utils/joi";
import {
  googleAuth,
  googleCallback,
  loginAuth,
  logoutAuth,
  registerAuth,
  verifyAuth,
} from "../controllers/auth";

const router = Router();

router.post("/login", nonAuth, loginAuth);
router.post("/register", nonAuth, validate(registerSchema), registerAuth);
router.post("/logout", auth, logoutAuth);
router.get("/verify", auth, verifyAuth);
router.get("/google", nonAuth, googleAuth);
router.get("/google/callback", nonAuth, googleCallback);

export default router;
