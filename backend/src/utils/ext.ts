import { type Request } from 'express';

// Sanitize URLs to hide sensitive query parameters
export function sanitizeUrl(url: string): string {
  return url.replace(
    /([?&](password|token|access_token|refresh_token|api_key)=)[^&]+/gi,
    '$1***'
  );
}

// Get client IP respecting proxies and cloud providers
export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    (req.headers['cf-connecting-ip'] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Mask email, e.g., john.doe@example.com -> j****e@example.com
export const maskEmail = (email: string): string => {
  if (!email.includes('@')) return email;

  const [username, domain] = email.split('@');
  if (!username) return email;

  if (username.length <= 2) return `${username[0]}*@${domain}`;

  const maskedUsername =
    username.charAt(0) +
    '*'.repeat(username.length - 2) +
    username.charAt(username.length - 1);

  return `${maskedUsername}@${domain}`;
};

// Mask phone number, e.g., 9876543210 -> 987****210
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
};

// Validate Indian mobile number
export const validateIndianMobile = (value: string): boolean => {
  const phoneRegex = /^(\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Invalid Indian mobile number');
  }
  return true;
};

// Format phone number with country code
export const formatPhoneNumber = (
  number: string,
  countryCode = '91'
): string => {
  // Remove all non-digits
  number = number.replace(/\D/g, '');

  // Remove leading 0 or country code if present to avoid duplication
  if (number.startsWith('0')) number = number.slice(1);
  if (number.startsWith(countryCode)) number = number.slice(countryCode.length);

  return `+${countryCode}${number}`;
};
