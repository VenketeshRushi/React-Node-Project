import multer from 'multer';
import { RequestHandler } from 'express';
import path from 'path';
import { config } from '@/config/index.js';
import { isAllowedFileType, generateFilename } from '@/utils/file.js';
import { ValidationError, PayloadTooLargeError } from '@/utils/CustomError.js';

type UploadFolder = keyof typeof config.storage.folders;

/**
 * Create multer storage for specific folder
 */
const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(config.storage.local.uploadDir, folder));
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
  const allowedExtensions = [...config.storage.local.allowedExtensions];
  const allowedMimeTypes = [...config.storage.local.allowedMimeTypes];

  // Validate file extension
  if (!isAllowedFileType(file.originalname, allowedExtensions)) {
    return cb(
      new ValidationError(
        `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`,
        {
          filename: file.originalname,
          mimetype: file.mimetype,
          allowedExtensions,
        }
      ),
      false
    );
  }

  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype as any)) {
    return cb(
      new ValidationError(`Invalid MIME type: ${file.mimetype}`, {
        filename: file.originalname,
        mimetype: file.mimetype,
        allowedMimeTypes,
      }),
      false
    );
  }

  cb(null, true);
};

/**
 * Create multer instance for specific folder
 */
const createUploader = (folder: UploadFolder) => {
  return multer({
    storage: createStorage(config.storage.folders[folder]),
    fileFilter,
    limits: {
      fileSize: config.storage.local.maxFileSize,
      files: 10,
      fields: 20,
      fieldSize: 1024 * 1024, // 1MB per field
    },
  });
};

/**
 * Error handler wrapper for multer middleware
 */
const handleMulterError = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new PayloadTooLargeError(
              `File size exceeds maximum allowed limit of ${Math.round(config.storage.local.maxFileSize / 1024 / 1024)}MB`
            )
          );
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ValidationError(`Too many files uploaded`));
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ValidationError(`Unexpected field: ${err.field}`));
        }

        if (err.code === 'LIMIT_FIELD_COUNT') {
          return next(new ValidationError(`Too many fields in request`));
        }

        // Generic Multer error
        return next(
          new ValidationError(err.message || 'File upload error', {
            code: err.code,
          })
        );
      }

      next(err);
    });
  };
};

/**
 * Single file upload middleware
 */
export const uploadSingle = (
  field: string,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return handleMulterError(createUploader(folder).single(field));
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (
  field: string,
  maxCount: number,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return handleMulterError(createUploader(folder).array(field, maxCount));
};

/**
 * Multiple fields upload middleware
 */
export const uploadFields = (
  fields: Array<{ name: string; maxCount: number }>,
  folder: UploadFolder = 'temp'
): RequestHandler => {
  return handleMulterError(createUploader(folder).fields(fields));
};

/**
 * Any files upload middleware (for dynamic field names)
 */
export const uploadAny = (folder: UploadFolder = 'temp'): RequestHandler => {
  return handleMulterError(createUploader(folder).any());
};
