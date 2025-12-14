import crypto, { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export const generateUUID = (): string => {
  return randomUUID();
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateRandomToken = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const encrypt = (text: string, key: string): string => {
  if (!key) throw new Error('Encryption key is required');

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedText: string, key: string): string => {
  if (!key) throw new Error('Decryption key is required');
  if (!encryptedText.includes(':'))
    throw new Error('Invalid encrypted text format');

  const parts = encryptedText.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted text format');

  const [ivHex, encryptedHex] = parts;
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted text format');

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};
