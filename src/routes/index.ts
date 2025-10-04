import { Router } from "express";
import { config } from "dotenv";
import auth from "../routes/auth";
import user from "../routes/user";
import link from "../routes/link";

config();

const api = Router();
const router = Router();
const version = process.env.API_VERSION;

api.use("/auth", auth);
api.use("/user", user);
api.use("/link", link);

router.use(`/api/${version}`, api);

export default router;
