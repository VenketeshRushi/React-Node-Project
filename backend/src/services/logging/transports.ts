import winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from '@/config/index.js';
import { LogLevel } from './levels.js';
import { consoleFormat } from './formats.js';

// Factory to create a daily rotating file transport
export const createDailyFileTransport = (
  level: LogLevel,
  folder: string
): winston.transport =>
  new winston.transports.DailyRotateFile({
    filename: `logs/${folder}/%DATE%-${level}.log`,
    datePattern: 'YYYY-MM-DD',
    level,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  });

// File transports
export const fileTransports: winston.transport[] = [
  createDailyFileTransport('error', 'error'),
  createDailyFileTransport('http', 'access'),
  createDailyFileTransport('info', 'combined'),
];

// Console transport factory for dev
export const createConsoleTransport = (): winston.transport =>
  new winston.transports.Console({
    level: config.app.logLevel,
    format: consoleFormat,
  });
