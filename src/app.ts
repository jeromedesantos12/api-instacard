import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import { resolve } from "path";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/error";
import { corsMiddleware } from "./utils/cors";
import { options } from "./utils/swagger";
import { notFound } from "./middlewares/notFound";
// import user from "./routes/user";
import router from "./routes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

config();

const url = process.env.BASE_URL;
const port = new URL(url as string).port;
const app = express();
const server = http.createServer(app);
const swaggerSpec = swaggerJSDoc(options);

app.use(cookieParser());
app.use(express.json());
app.use(corsMiddleware);
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/uploads", express.static(resolve(process.cwd(), "uploads")));
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use("/api/v1", user);

app.use(router);
app.use("*catchall", notFound);
app.use(errorHandler);

server.listen(port, () =>
  console.log(`
    ░█████╗██╗░░██╗
    ██╔══██╗██║░██╔╝
    ██║░░██║█████═╝░
    ██║░░██║██╔═██╗░
    ╚█████╔╝██║░╚██╗
    ░╚════╝░╚═╝░░╚═╝
    
    𝗟𝗼𝗰𝗮𝗹: ${url}
    `)
);
