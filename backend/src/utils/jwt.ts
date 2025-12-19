import jwt from 'jsonwebtoken';
import {
  BadRequestError,
  BadTokenError,
  InternalError,
  TokenExpiredError,
} from '@/utils/CustomError.js';
import { config } from '@/config/index.js';

export type JwtTokenType = 'accessToken' | 'refreshToken';

export interface JwtPayloadData {
  id: string;
  email: string;
  role: string;
  name: string;
  onboarding: boolean;
  is_active: boolean;
  is_banned: boolean;
}

export class JwtPayload implements JwtPayloadData {
  aud: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  email: string;
  role: string;
  id: string;
  name: string;
  onboarding: boolean;
  avatar_url?: string | null;
  is_active: boolean;
  is_banned: boolean;
  type: JwtTokenType;

  constructor(payload: JwtPayloadData, type: JwtTokenType = 'accessToken') {
    this.iss = config.jwt.issuer;
    this.aud = config.jwt.audience;
    this.sub = payload.id;
    this.id = payload.id;
    this.email = payload.email;
    this.role = payload.role;
    this.name = payload.name;
    this.onboarding = payload.onboarding;
    this.is_active = payload.is_active;
    this.is_banned = payload.is_banned;
    this.type = type;
    this.iat = Math.floor(Date.now() / 1000);
    const validity =
      type === 'accessToken'
        ? config.jwt.accessExpiresIn
        : config.jwt.refreshExpiresIn;
    this.exp = this.iat + validity;
  }
}

// Encode token
export async function encode(payload: JwtPayload): Promise<string> {
  const secret = config.jwt.secret;
  if (!secret) throw new InternalError('JWT secret is not set');

  return new Promise((resolve, reject) => {
    jwt.sign({ ...payload }, secret, { algorithm: 'HS256' }, (err, token) => {
      if (err) return reject(new InternalError('Token generation failure'));
      resolve(token as string);
    });
  });
}

// Decode token without verifying
export function decode(token: string): JwtPayload {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    throw new BadTokenError('Invalid token format');
  }
  return decoded as JwtPayload;
}

// Validate token securely
export async function validate(
  token: string,
  expectedType?: JwtTokenType
): Promise<JwtPayload> {
  const secret = config.jwt.secret;
  if (!token) throw new BadTokenError('Token is required');
  if (!secret) throw new InternalError('JWT secret is not set');

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      { issuer: config.jwt.issuer, audience: config.jwt.audience },
      (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError')
            return reject(new TokenExpiredError('Token has expired'));
          if (err.name === 'JsonWebTokenError')
            return reject(new BadTokenError('Invalid token'));
          if (err.name === 'NotBeforeError')
            return reject(new BadTokenError('Token not yet active'));
          return reject(new BadRequestError('Token validation failed'));
        }

        const payload = decoded as JwtPayload;
        if (expectedType && payload.type !== expectedType) {
          return reject(
            new BadTokenError(
              `Invalid token type: expected ${expectedType}, got ${payload.type}`
            )
          );
        }
        resolve(payload);
      }
    );
  });
}

export async function validateAccessToken(token: string) {
  return validate(token, 'accessToken');
}

export async function validateRefreshToken(token: string) {
  return validate(token, 'refreshToken');
}

export async function generateTokens(payload: JwtPayloadData) {
  const accessPayload = new JwtPayload(payload, 'accessToken');
  const refreshPayload = new JwtPayload(payload, 'refreshToken');
  const [accessToken, refreshToken] = await Promise.all([
    encode(accessPayload),
    encode(refreshPayload),
  ]);
  return { accessToken, refreshToken };
}

export default {
  encode,
  decode,
  validate,
  validateAccessToken,
  validateRefreshToken,
  generateTokens,
};
