import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-hot-toast";

interface ApiErrorResponse {
  type?: string;
  message?: string;
  data?: unknown;
}

export interface NormalizedError {
  status: number | null;
  type?: string | null;
  message: string;
  data?: unknown;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Validation Error",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false; // prevents parallel refresh calls
let hasLoggedOut = false; // prevents logout loops

let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    await Axios.post("/auth/refresh");
    return true; // cookies updated by backend
  } catch {
    return false;
  }
};

Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  error => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response: AxiosResponse) => response,

  async error => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    let normalizedError: NormalizedError = {
      status: null,
      type: null,
      message: "Network Error",
    };

    if (!axios.isAxiosError(error)) {
      normalizedError.message =
        error instanceof Error ? error.message : "Unexpected error";
      toast.error(normalizedError.message);
      return Promise.reject(normalizedError);
    }

    if (!error.response) {
      normalizedError.message =
        "Unable to reach server. Please try again later.";
      toast.error(normalizedError.message);
      return Promise.reject(normalizedError);
    }

    const { status, data } = error.response;
    const responseData = (data?.error ?? {}) as ApiErrorResponse;

    normalizedError = {
      status,
      type: responseData.type ?? null,
      message:
        responseData.message ?? STATUS_MESSAGES[status] ?? `Error ${status}`,
      data: responseData.data,
    };

    // Handle expired access token
    if (status === 401 && !originalRequest._retry) {
      const isAuthRoute =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/google/callback");

      if (isAuthRoute) {
        return Promise.reject(normalizedError);
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => Axios(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const success = await refreshAccessToken();
      isRefreshing = false;

      if (success) {
        processQueue();
        return Axios(originalRequest);
      }

      processQueue(new Error("Refresh failed"));

      if (!hasLoggedOut) {
        hasLoggedOut = true;
        toast.error("Session expired. Please log in again.");
        useAuthStore.getState().logout({ redirect: true });
      }

      return Promise.reject({
        ...normalizedError,
        message: "Session expired",
      });
    }

    toast.error(normalizedError.message);
    return Promise.reject(normalizedError);
  }
);

export default Axios;
