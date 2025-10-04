import { Router } from "express";
import auth from "../routes/auth";
import user from "../routes/user";
import { config } from "dotenv";

config();

const api = Router();
const router = Router();
const version = process.env.API_VERSION;

api.use("/auth", auth);
api.use("/user", user);

router.use(`/api/${version}`, api);

export default router;
