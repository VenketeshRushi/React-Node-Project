import { slugify } from './string.js';

export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot + 1);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const isAllowedFileType = (
  filename: string,
  allowedTypes: string[]
): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

export const generateFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = getFileExtension(originalName);
  const lastDot = originalName.lastIndexOf('.');
  const nameWithoutExt =
    lastDot === -1 ? originalName : originalName.slice(0, lastDot);

  return `${slugify(nameWithoutExt)}-${timestamp}-${random}.${ext}`;
};

export const getFileUrl = (filename: string, folder: string): string => {
  return `/uploads/${folder}/${filename}`;
};
