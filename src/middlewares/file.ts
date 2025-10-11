import { Request, Response, NextFunction } from "express";
import { extension } from "mime-types";
import { appError } from "../utils/error";

export function isFiles(req: Request, res: Response, next: NextFunction) {
  const files = (req as any).files;
  if (!files || Object.keys(files).length === 0) {
    throw appError("No file uploaded", 400);
  }
  next();
}

export function saveFiles(req: Request, res: Response, next: NextFunction) {
  const files = (req as any).files;
  if (Object.keys(files).length !== 0 && typeof files === "object") {
    const processedFiles: Record<string, any> = {};
    for (const fieldName in files) {
      const fileArray = files[fieldName];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const ext = extension(file.mimetype);
        const uniqueSuffix = Date.now() + `-` + Math.round(Math.random() * 1e9);
        const fileName = fieldName + "-" + uniqueSuffix + "." + ext;
        const fileBuffer = file.buffer;
        processedFiles[fieldName] = {
          fileName,
          fileBuffer,
        };
      }
    }
    (req as any).processedFiles = processedFiles;
  }
  next();
}
