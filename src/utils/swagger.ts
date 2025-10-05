import { resolve } from "path";

const url = process.env.BASE_URL;
export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InstaCard API",
      description: "API for linktree",
      version: "1.0.0",
    },
    servers: [
      {
        url,
        description: "Local Server",
      },
    ],
  },
  apis: [resolve(process.cwd(), "src/routes/*.ts")],
};
