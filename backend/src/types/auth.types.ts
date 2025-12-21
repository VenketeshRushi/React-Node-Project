export type UserRole = 'user' | 'admin' | 'superadmin';
export type LoginMethod = 'email_password' | 'google_oauth' | 'facebook_oauth';
export type OAuthProvider = 'google' | 'facebook';

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;

  onboarding: boolean;

  profession?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;

  avatar_url?: string | null;
  timezone?: string | null;
  language?: string | null;

  login_method: LoginMethod;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface OAuthProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
  provider: OAuthProvider;
  _raw: string;
  _json: any;
}

export interface OAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserWithoutPassword;
}

export interface CookieOptions {
  httpOnly: boolean;
  path: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
}
