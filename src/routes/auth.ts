import { Router } from "express";
import { auth, nonAuth, isExist } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { forgotSchema, registerSchema, resetSchema } from "../utils/joi";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetUser,
  forgotUser,
  verifyUser,
} from "../controllers/auth";

const router = Router();

router.post("/login", nonAuth, loginUser);
router.post("/register", nonAuth, validate(registerSchema), registerUser);
router.post("/forgot", nonAuth, validate(forgotSchema), forgotUser);
router.post("/logout", auth, logoutUser);
router.put(
  "/reset/:id",
  nonAuth,
  isExist("user"),
  validate(resetSchema),
  resetUser
);
router.get("/verify", auth, verifyUser);

export default router;
