/**
 * Utility functions for React + Vite applications
 * Includes Cookie, LocalStorage, SessionStorage management and common helpers
 *
 * @module ext
 * @description Centralized utility functions for storage management, data encoding,
 * and common UI operations in a React + Vite environment.
 */

import Cookies from "js-cookie";
import type { RefObject } from "react";

// Environment detection for dev/prod specific behavior
const isDevelopment = import.meta.env.VITE_MODE === "dev";

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Creates a promise that resolves after a specified delay
 * Useful for simulating API delays, debouncing, or adding intentional pauses
 *
 * @param ms - The number of milliseconds to wait
 * @returns Promise that resolves after the specified time
 *
 * @example
 * await delay(1000); // Wait for 1 second
 * console.log("Executed after 1 second");
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(res => setTimeout(res, ms));

// ============================================================================
// DATA ENCODING/DECODING UTILITIES
// ============================================================================

/**
 * Encodes any data structure into a Base64 string
 * Handles objects, arrays, strings, and primitives
 *
 * @param data - Any JavaScript value to encode
 * @returns A URL-safe Base64-encoded string
 *
 * @example
 * const encoded = encodeData({ user: "john", id: 123 });
 * // Returns: "eyJ1c2VyIjoiam9obiIsImlkIjoxMjN9"
 */
export const encodeData = (data: unknown): string => {
  const jsonString = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonString));
};

/**
 * Decodes a Base64 string back into the original data structure
 * Returns null if decoding fails
 *
 * @param encoded - The Base64-encoded string to decode
 * @returns The decoded data with type safety, or null on failure
 *
 * @example
 * const data = decodeData<{user: string, id: number}>(encodedString);
 * if (data) console.log(data.user, data.id);
 */
export const decodeData = <T = unknown>(encoded: string): T | null => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Failed to decode data:", e);
    return null;
  }
};

// ============================================================================
// COOKIE UTILITIES
// ============================================================================

/**
 * Flexible cookie setter with multiple signatures
 * Automatically handles development vs production environments
 *
 * Development: No secure flag (works on localhost HTTP)
 * Production: Adds secure flag for HTTPS connections
 *
 * @param keyOrObject - Single key string or object with multiple key-value pairs
 * @param valueOrOptions - Value string, expiry days, or cookie options object
 * @param days - Optional expiry in days (only for single key-value signature)
 *
 * @example
 * // Single cookie with expiry
 * setCookies("token", "abc123", 7);
 *
 * @example
 * // Multiple cookies at once
 * setCookies({ token: "abc123", user: "john" }, { expires: 7 });
 *
 * @example
 * // With custom options
 * setCookies("session", "xyz", { expires: 1, domain: ".example.com" });
 */
export const setCookies = (
  keyOrObject: string | Record<string, string>,
  valueOrOptions?: string | Cookies.CookieAttributes | number,
  days?: number
): void => {
  // Case 1: setCookies("token", "123", 7)
  if (typeof keyOrObject === "string") {
    const key = keyOrObject;
    const value = valueOrOptions as string;

    const options: Cookies.CookieAttributes = {
      path: "/",
      sameSite: "lax", // CSRF protection while allowing top-level navigation
    };

    // Only set secure flag in production with HTTPS
    if (!isDevelopment && window.location.protocol === "https:") {
      options.secure = true;
    }

    if (typeof days === "number") {
      options.expires = days;
    }

    Cookies.set(key, value, options);

    // Debug log in development
    if (isDevelopment) {
      console.log(`[DEV] Cookie set: ${key} =`, Cookies.get(key));
    }
    return;
  }

  // Case 2: setCookies({ a: "1", b: "2" }, { expires: 10 })
  const cookies = keyOrObject;
  const options = (valueOrOptions as Cookies.CookieAttributes) || {};

  Object.entries(cookies).forEach(([key, value]) => {
    const finalOptions: Cookies.CookieAttributes = {
      path: "/",
      sameSite: "lax",
      ...options,
    };

    // Only set secure flag in production with HTTPS
    if (!isDevelopment && window.location.protocol === "https:") {
      finalOptions.secure = true;
    }

    Cookies.set(key, value, finalOptions);

    // Debug log in development
    if (isDevelopment) {
      console.log(`[DEV] Cookie set: ${key} =`, Cookies.get(key));
    }
  });
};

/**
 * Retrieves cookie values by key(s)
 *
 * @param keys - Optional array of cookie names. Omit to get all cookies
 * @returns Object mapping cookie names to their values (undefined if not found)
 *
 * @example
 * const { token, user } = getCookies(["token", "user"]);
 *
 * @example
 * const allCookies = getCookies(); // Get all available cookies
 */
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

/**
 * Removes specified cookies
 * Defaults to removing common authentication cookies
 *
 * @param keys - Array of cookie names to remove
 *
 * @example
 * removeCookies(["accessToken", "user"]);
 *
 * @example
 * removeCookies(); // Removes default auth cookies: accessToken, user
 */
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

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Sets item(s) in localStorage with automatic serialization
 * Supports both single key-value and bulk operations
 * Objects are automatically stringified
 *
 * @param keyOrObject - Single key or object with multiple key-value pairs
 * @param value - Value to store (can be any type, will be serialized)
 *
 * @example
 * // Store a string
 * setLocalStorage("theme", "dark");
 *
 * @example
 * // Store an object
 * setLocalStorage("user", { name: "John", age: 30 });
 *
 * @example
 * // Store multiple items at once
 * setLocalStorage({ theme: "dark", language: "en", userId: "123" });
 */
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

/**
 * Retrieves item(s) from localStorage with automatic parsing
 *
 * @param keys - Optional array of keys. Omit to get all localStorage items
 * @param parse - Whether to JSON.parse values (default: true)
 * @returns Object mapping keys to their values (null if not found)
 *
 * @example
 * // Get specific items (auto-parsed)
 * const { theme, user } = getLocalStorage<{theme: string, user: User}>(["theme", "user"]);
 *
 * @example
 * // Get raw strings without parsing
 * const { token } = getLocalStorage(["token"], false);
 *
 * @example
 * // Get all localStorage items
 * const allData = getLocalStorage();
 */
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

/**
 * Removes item(s) from localStorage
 *
 * @param keys - Array of keys to remove. Omit to clear all localStorage
 *
 * @example
 * removeLocalStorage(["theme", "user"]);
 *
 * @example
 * removeLocalStorage(); // Clear everything
 */
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

// ============================================================================
// SESSION STORAGE UTILITIES
// ============================================================================

/**
 * Sets item(s) in sessionStorage with automatic serialization
 * Data persists only for the current browser session/tab
 *
 * @param keyOrObject - Single key or object with multiple key-value pairs
 * @param value - Value to store (can be any type, will be serialized)
 *
 * @example
 * // Store temporary form data
 * setSessionStorage("formDraft", { name: "John", email: "john@example.com" });
 *
 * @example
 * // Store multiple session items
 * setSessionStorage({ currentStep: 2, tempData: "xyz" });
 */
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

/**
 * Retrieves item(s) from sessionStorage with automatic parsing
 *
 * @param keys - Optional array of keys. Omit to get all sessionStorage items
 * @param parse - Whether to JSON.parse values (default: true)
 * @returns Object mapping keys to their values (null if not found)
 *
 * @example
 * const { formDraft } = getSessionStorage(["formDraft"]);
 *
 * @example
 * const allSessionData = getSessionStorage();
 */
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

/**
 * Removes item(s) from sessionStorage
 *
 * @param keys - Array of keys to remove. Omit to clear all sessionStorage
 *
 * @example
 * removeSessionStorage(["formDraft", "tempData"]);
 *
 * @example
 * removeSessionStorage(); // Clear everything in current session
 */
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

// ============================================================================
// UI UTILITIES
// ============================================================================

/**
 * Smoothly scrolls a container to its bottom
 * Useful for chat interfaces, notification lists, or auto-scrolling content
 *
 * @param containerRef - React ref pointing to the scrollable container
 * @param smooth - Whether to animate the scroll (default: true)
 *
 * @example
 * const chatRef = useRef<HTMLDivElement>(null);
 * // After adding a new message
 * scrollToBottom(chatRef);
 *
 * @example
 * // Instant scroll without animation
 * scrollToBottom(chatRef, false);
 */
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

/**
 * Smoothly scrolls a container to its top
 * Useful for "back to top" functionality
 *
 * @param containerRef - React ref pointing to the scrollable container
 * @param smooth - Whether to animate the scroll (default: true)
 *
 * @example
 * scrollToTop(contentRef);
 */
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

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Evaluates password strength based on common security criteria
 * Returns score, label, and Tailwind color class for easy UI integration
 *
 * @param password - The password string to evaluate
 * @param minLength - Minimum required length (default: 8)
 * @returns Object with score (0-5), label, and Tailwind color class
 *
 * @example
 * const { score, label, color } = getPasswordStrength("MyP@ss123");
 * // Returns: { score: 5, label: "Strong", color: "bg-green-500" }
 *
 * @example
 * // Use in component
 * <div className={`h-2 rounded ${color}`} style={{ width: `${score * 20}%` }} />
 * <span>{label}</span>
 */
export const getPasswordStrength = (password: string, minLength = 8) => {
  let strength = 0;
  if (password.length >= minLength) strength++;
  if (/[A-Z]/.test(password)) strength++; // Has uppercase
  if (/[a-z]/.test(password)) strength++; // Has lowercase
  if (/\d/.test(password)) strength++; // Has number
  if (/[@$!%*?&#]/.test(password)) strength++; // Has special char

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

/**
 * Validates email format using regex
 *
 * @param email - Email string to validate
 * @returns True if email format is valid
 *
 * @example
 * if (isValidEmail(userInput)) {
 *   // Proceed with email
 * }
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates URL format
 *
 * @param url - URL string to validate
 * @returns True if URL format is valid
 *
 * @example
 * if (isValidUrl(input)) {
 *   window.open(input, "_blank");
 * }
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncates a string to specified length and adds ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated string
 *
 * @example
 * truncateString("This is a very long text", 10);
 * // Returns: "This is a..."
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * capitalize("hello world"); // Returns: "Hello world"
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case
 *
 * @param str - String to convert
 * @returns String in title case
 *
 * @example
 * toTitleCase("hello world from react"); // Returns: "Hello World From React"
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Formats a number with thousand separators
 *
 * @param num - Number to format
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567.89); // Returns: "1,234,567.89"
 */
export const formatNumber = (num: number, locale = "en-US"): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Formats a number as currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: "USD")
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56); // Returns: "$1,234.56"
 * formatCurrency(1234.56, "EUR", "de-DE"); // Returns: "1.234,56 €"
 */
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

/**
 * Generates a random number between min and max (inclusive)
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number
 *
 * @example
 * randomNumber(1, 10); // Returns: random number between 1 and 10
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffles an array using Fisher-Yates algorithm
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 *
 * @example
 * const shuffled = shuffleArray([1, 2, 3, 4, 5]);
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Removes duplicate values from an array
 *
 * @param array - Array to deduplicate
 * @returns New array with unique values
 *
 * @example
 * uniqueArray([1, 2, 2, 3, 3, 4]); // Returns: [1, 2, 3, 4]
 */
export const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Formats a date to a readable string
 *
 * @param date - Date object or timestamp
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()); // Returns: "12/13/2024"
 * formatDate(Date.now(), { dateStyle: "full" }); // Returns: "Friday, December 13, 2024"
 */
export const formatDate = (
  date: Date | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "short" }
): string => {
  return new Intl.DateTimeFormat("en-US", options).format(
    typeof date === "number" ? new Date(date) : date
  );
};

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date object or timestamp
 * @returns Relative time string
 *
 * @example
 * getRelativeTime(Date.now() - 3600000); // Returns: "1 hour ago"
 */
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

// ============================================================================
// CLIPBOARD UTILITIES
// ============================================================================

/**
 * Copies text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 *
 * @example
 * await copyToClipboard("Hello World");
 * toast.success("Copied to clipboard!");
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw err;
  }
};

// ============================================================================
// DEBOUNCE/THROTTLE UTILITIES
// ============================================================================

/**
 * Creates a debounced function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked
 *
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 *
 * @example
 * const handleSearch = debounce((query: string) => {
 *   fetchResults(query);
 * }, 500);
 */
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
