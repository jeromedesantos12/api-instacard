import { Router } from "express";
import { home } from "../middlewares/home";
import { notFound } from "../middlewares/notFound";
import auth from "../routes/auth";
import user from "../routes/user";
import link from "../routes/link";
import social from "../routes/social";

const api = Router();
const router = Router();
const version = process.env.API_VERSION;

api.use("/auth", auth);
api.use("/user", user);
api.use("/link", link);
api.use("/social", social);
api.use("*catchall", notFound);

router.use(`/api/${version}`, api);

export default router;
