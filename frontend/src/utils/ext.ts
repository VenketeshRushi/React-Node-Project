import Cookies from "js-cookie";
import type { RefObject } from "react";

const isDevelopment = import.meta.env.VITE_MODE === "dev";

// Async utilities
export const delay = (ms: number): Promise<void> =>
  new Promise(res => setTimeout(res, ms));

// Data encoding/decoding
export const encodeData = (data: unknown): string => {
  const jsonString = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonString));
};

export const decodeData = <T = unknown>(encoded: string): T | null => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Failed to decode data:", e);
    return null;
  }
};

// Cookie utilities
export const setCookies = (
  keyOrObject: string | Record<string, string>,
  valueOrOptions?: string | Cookies.CookieAttributes | number,
  days?: number
): void => {
  if (typeof keyOrObject === "string") {
    const key = keyOrObject;
    const value = valueOrOptions as string;

    const options: Cookies.CookieAttributes = {
      path: "/",
      sameSite: "lax",
    };

    if (!isDevelopment && window.location.protocol === "https:") {
      options.secure = true;
    }

    if (typeof days === "number") {
      options.expires = days;
    }

    Cookies.set(key, value, options);

    if (isDevelopment) {
      console.log(`[DEV] Cookie set: ${key} =`, Cookies.get(key));
    }
    return;
  }

  const cookies = keyOrObject;
  const options = (valueOrOptions as Cookies.CookieAttributes) || {};

  Object.entries(cookies).forEach(([key, value]) => {
    const finalOptions: Cookies.CookieAttributes = {
      path: "/",
      sameSite: "lax",
      ...options,
    };

    if (!isDevelopment && window.location.protocol === "https:") {
      finalOptions.secure = true;
    }

    Cookies.set(key, value, finalOptions);

    if (isDevelopment) {
      console.log(`[DEV] Cookie set: ${key} =`, Cookies.get(key));
    }
  });
};

export const getCookies = (
  keys?: string[]
): Record<string, string | undefined> => {
  if (!keys || keys.length === 0) return Cookies.get();
  const result: Record<string, string | undefined> = {};
  keys.forEach(key => {
    result[key] = Cookies.get(key);
  });
  return result;
};

export const removeCookies = (
  keys: string[] = ["accessToken", "user"]
): void => {
  keys.forEach(key => {
    Cookies.remove(key, { path: "/" });
    if (isDevelopment) {
      console.log(`[DEV] Cookie removed: ${key}`);
    }
  });
};

// LocalStorage utilities
export const setLocalStorage = (
  keyOrObject: string | Record<string, unknown>,
  value?: unknown
): void => {
  try {
    if (typeof keyOrObject === "string") {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(keyOrObject, serialized);
      if (isDevelopment) {
        console.log(`[DEV] LocalStorage set: ${keyOrObject}`);
      }
    } else {
      Object.entries(keyOrObject).forEach(([key, val]) => {
        const serialized = typeof val === "string" ? val : JSON.stringify(val);
        localStorage.setItem(key, serialized);
        if (isDevelopment) {
          console.log(`[DEV] LocalStorage set: ${key}`);
        }
      });
    }
  } catch (e) {
    console.error("Failed to set localStorage:", e);
  }
};

export const getLocalStorage = <T = unknown>(
  keys?: string[],
  parse = true
): Record<string, T | string | null> => {
  try {
    if (!keys || keys.length === 0) {
      const result: Record<string, T | string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value && parse) {
            try {
              result[key] = JSON.parse(value) as T;
            } catch {
              result[key] = value;
            }
          } else {
            result[key] = value;
          }
        }
      }
      return result;
    }

    const result: Record<string, T | string | null> = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && parse) {
        try {
          result[key] = JSON.parse(value) as T;
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    });
    return result;
  } catch (e) {
    console.error("Failed to get localStorage:", e);
    return {};
  }
};

export const removeLocalStorage = (keys?: string[]): void => {
  try {
    if (!keys || keys.length === 0) {
      localStorage.clear();
      if (isDevelopment) {
        console.log("[DEV] LocalStorage cleared");
      }
    } else {
      keys.forEach(key => {
        localStorage.removeItem(key);
        if (isDevelopment) {
          console.log(`[DEV] LocalStorage removed: ${key}`);
        }
      });
    }
  } catch (e) {
    console.error("Failed to remove from localStorage:", e);
  }
};

// SessionStorage utilities
export const setSessionStorage = (
  keyOrObject: string | Record<string, unknown>,
  value?: unknown
): void => {
  try {
    if (typeof keyOrObject === "string") {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      sessionStorage.setItem(keyOrObject, serialized);
      if (isDevelopment) {
        console.log(`[DEV] SessionStorage set: ${keyOrObject}`);
      }
    } else {
      Object.entries(keyOrObject).forEach(([key, val]) => {
        const serialized = typeof val === "string" ? val : JSON.stringify(val);
        sessionStorage.setItem(key, serialized);
        if (isDevelopment) {
          console.log(`[DEV] SessionStorage set: ${key}`);
        }
      });
    }
  } catch (e) {
    console.error("Failed to set sessionStorage:", e);
  }
};

export const getSessionStorage = <T = unknown>(
  keys?: string[],
  parse = true
): Record<string, T | string | null> => {
  try {
    if (!keys || keys.length === 0) {
      const result: Record<string, T | string | null> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value && parse) {
            try {
              result[key] = JSON.parse(value) as T;
            } catch {
              result[key] = value;
            }
          } else {
            result[key] = value;
          }
        }
      }
      return result;
    }

    const result: Record<string, T | string | null> = {};
    keys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value && parse) {
        try {
          result[key] = JSON.parse(value) as T;
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    });
    return result;
  } catch (e) {
    console.error("Failed to get sessionStorage:", e);
    return {};
  }
};

export const removeSessionStorage = (keys?: string[]): void => {
  try {
    if (!keys || keys.length === 0) {
      sessionStorage.clear();
      if (isDevelopment) {
        console.log("[DEV] SessionStorage cleared");
      }
    } else {
      keys.forEach(key => {
        sessionStorage.removeItem(key);
        if (isDevelopment) {
          console.log(`[DEV] SessionStorage removed: ${key}`);
        }
      });
    }
  } catch (e) {
    console.error("Failed to remove from sessionStorage:", e);
  }
};

// UI utilities
export const scrollToBottom = (
  containerRef: RefObject<HTMLElement>,
  smooth = true
) => {
  const container = containerRef.current;
  if (!container) return;
  const lastMessage = container.lastElementChild as HTMLElement | null;
  lastMessage?.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "end",
  });
};

export const scrollToTop = (
  containerRef: RefObject<HTMLElement>,
  smooth = true
) => {
  const container = containerRef.current;
  if (!container) return;
  container.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

// Validation utilities
export const getPasswordStrength = (password: string, minLength = 8) => {
  let strength = 0;
  if (password.length >= minLength) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&#]/.test(password)) strength++;

  return {
    score: strength,
    label: strength <= 2 ? "Weak" : strength <= 4 ? "Good" : "Strong",
    color:
      strength <= 2
        ? "bg-red-500"
        : strength <= 4
          ? "bg-yellow-500"
          : "bg-green-500",
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// String utilities
export const truncateString = (
  str: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Number utilities
export const formatNumber = (num: number, locale = "en-US"): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCurrency = (
  amount: number,
  currency = "USD",
  locale = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Array utilities
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// Date utilities
export const formatDate = (
  date: Date | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "short" }
): string => {
  return new Intl.DateTimeFormat("en-US", options).format(
    typeof date === "number" ? new Date(date) : date
  );
};

export const getRelativeTime = (date: Date | number): string => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = Date.now();
  const then = typeof date === "number" ? date : date.getTime();
  const diffInSeconds = Math.floor((then - now) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      const value = Math.floor(diffInSeconds / secondsInUnit);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, "second");
};

// Clipboard utilities
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw err;
  }
};

// Debounce/throttle utilities
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Creates a throttled function that only invokes func at most once per wait milliseconds
 *
 * @param func - Function to throttle
 * @param wait - Milliseconds to wait between calls
 * @returns Throttled function
 *
 * @example
 * const handleScroll = throttle(() => {
 *   checkScrollPosition();
 * }, 200);
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Generates a cryptographically secure random code verifier
 */
export function generateCodeVerifier(length: number = 128): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = new Uint8Array(length);

  window.crypto.getRandomValues(randomValues);

  let codeVerifier = "";
  for (let i = 0; i < length; i++) {
    codeVerifier += characters[randomValues[i] % characters.length];
  }

  return codeVerifier;
}

/**
 * Calculates the code challenge from a code verifier using SHA-256
 */
export async function calculateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generates a PKCE pair (verifier and challenge)
 */
export async function generatePKCEPair(length: number = 128): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateCodeVerifier(length);
  const codeChallenge = await calculateCodeChallenge(codeVerifier);

  return { codeVerifier, codeChallenge };
}

// File utilities
export function base64ToFile(dataurl: string, filename: string) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)?.[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(`${fileReader.result}`);
    };
    fileReader.onerror = error => {
      reject(error);
    };
  });
}

export function triggerDownload(filename: string, text: string) {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
