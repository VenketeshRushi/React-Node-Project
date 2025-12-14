import multer from 'multer';
import { RequestHandler } from 'express';
import path from 'path';
import { storageConfig } from '@/config/storage.config.js';
import { isAllowedFileType, generateFilename } from '@/utils/file.js';

type UploadFolder = keyof typeof storageConfig.folders;

/**
 * Create multer storage for specific folder
 */
const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(storageConfig.local.uploadDir, folder));
    },
    filename: (_req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    },
  });
};

/**
 * File filter validation
 */
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedExtensions = [...storageConfig.local.allowedExtensions];
  const allowedMimeTypes = [...storageConfig.local.allowedMimeTypes];

  if (!isAllowedFileType(file.originalname, allowedExtensions)) {
    return cb(
      new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`)
    );
  }

  if (!allowedMimeTypes.includes(file.mimetype as any)) {
    return cb(new Error(`Invalid MIME type: ${file.mimetype}`));
  }

  cb(null, true);
};

/**
 * Create multer instance for specific folder
 */
const createUploader = (folder: UploadFolder) => {
  return multer({
    storage: createStorage(storageConfig.folders[folder]),
    fileFilter,
    limits: {
      fileSize: storageConfig.local.maxFileSize,
      files: 10,
    },
  });
};

/**
 * Single file upload middleware
 */
export const uploadSingle = (
  field: string,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return createUploader(folder).single(field);
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (
  field: string,
  maxCount: number,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return createUploader(folder).array(field, maxCount);
};

/**
 * Multiple fields upload middleware
 */
export const uploadFields = (
  fields: Array<{ name: string; maxCount: number }>,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return createUploader(folder).fields(fields);
};
