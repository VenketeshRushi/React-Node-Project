import winston from 'winston';

export const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // capture error.stack when available
  winston.format.splat(),
  winston.format.json()
);

export const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    const { timestamp, level, message, stack, ...meta } = info as any;

    const safeMessage =
      typeof message === 'string' ? message : JSON.stringify(message, null, 2);

    const metaKeys = Object.keys(meta);
    const metaString = metaKeys.length
      ? ` ${JSON.stringify(meta, null, 2)}`
      : '';

    const stackString = stack ? `\n${stack}` : '';

    return `[${timestamp}] [${level}]: ${safeMessage}${metaString}${stackString}`;
  })
);
