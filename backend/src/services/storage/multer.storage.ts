import fs from 'fs';
import path from 'path';
import { storageConfig } from '@/config/index.js';
import { logger } from '@/services/logging/logger.js';

export const ensureUploadDirs = (): void => {
  Object.values(storageConfig.folders).forEach(folder => {
    const dir = path.join(storageConfig.local.uploadDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`[Storage] Created upload directory: ${dir}`);
    }
  });
};

// Call on startup
ensureUploadDirs();
