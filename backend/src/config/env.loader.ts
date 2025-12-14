import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });
  if (result.error) {
    console.error('Error loading .env:', result.error.message);
    process.exit(1);
  }
  console.log(
    `Loaded ${Object.keys(result.parsed || {}).length} env variables from .env`
  );
} else {
  console.log(
    'Production mode: env variables are injected from docker/kubernetes or cloud platform'
  );
}

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getRequiredNumberEnv = (key: string): number => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return num;
};

export const getRequiredBooleanEnv = (key: string): boolean => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.toLowerCase() === 'true';
};
