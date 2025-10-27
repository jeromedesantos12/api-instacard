import cors from "cors";
import { config } from "dotenv";

config();

const CORS_URL = process.env.CORS_URL as string;

export const corsMiddleware = cors({
  origin: [CORS_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
});
