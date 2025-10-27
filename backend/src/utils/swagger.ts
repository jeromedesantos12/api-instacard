import YAML from "yamljs";
import { resolve } from "path";

const swaggerApi = YAML.load(resolve(process.cwd(), "swagger/api.yaml"));
const swaggerPaths = YAML.load(resolve(process.cwd(), "swagger/paths.yaml"));
const swaggerModels = YAML.load(resolve(process.cwd(), "swagger/models.yaml"));
export const swaggerDocument = {
  ...swaggerApi,
  paths: swaggerPaths,
  components: swaggerModels,
};
