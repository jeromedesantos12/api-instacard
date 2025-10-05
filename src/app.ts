import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import { resolve } from "path";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/error";
import { corsMiddleware } from "./utils/cors";
import { notFound } from "./middlewares/notFound";
import router from "./routes";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

config();

const url = process.env.BASE_URL;
const port = new URL(url as string).port;
const app = express();
const server = http.createServer(app);
const swaggerApi = YAML.load(resolve(process.cwd(), "swagger/api.yaml"));
const swaggerPaths = YAML.load(resolve(process.cwd(), "swagger/paths.yaml"));
const swaggerModels = YAML.load(resolve(process.cwd(), "swagger/models.yaml"));

const swaggerDocument = {
  ...swaggerApi,
  paths: swaggerPaths,
  components: swaggerModels,
};

app.use(cookieParser());
app.use(express.json());
app.use(corsMiddleware);
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(resolve(process.cwd(), "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
