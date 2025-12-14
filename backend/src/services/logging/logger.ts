import winston from 'winston';
import { config } from '@/config/index.js';
import { logLevels } from './levels.js';
import { fileFormat } from './formats.js';
import { fileTransports, createConsoleTransport } from './transports.js';

const transports: winston.transport[] = [...fileTransports];

if (config.app.nodeEnv !== 'production') {
  transports.push(createConsoleTransport());
}

export const logger = winston.createLogger({
  level: config.app.logLevel,
  levels: logLevels,
  format: fileFormat,
  transports,
});
