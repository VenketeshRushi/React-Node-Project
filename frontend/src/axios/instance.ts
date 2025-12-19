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
  message?: string;
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

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: unknown = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Refresh the access token
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL ?? "/api"}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data?.accessToken) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

// Request interceptor
Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh logic
Axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    let status: number | null = null;
    let type: string | null = null;
    let message = "Network Error";
    let data: unknown = undefined;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        status = error.response.status;
        const responseData = error.response.data.error as ApiErrorResponse;

        type = responseData?.type ?? null;
        message =
          responseData?.message ?? STATUS_MESSAGES[status] ?? `Error ${status}`;
        data = responseData?.data;

        // Handle 401 Unauthorized - Try to refresh token
        if (status === 401 && !originalRequest._retry) {
          // Skip refresh for auth endpoints
          if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/google/callback")
          ) {
            toast.error(message);
            useAuthStore.getState().logout();
            return Promise.reject({
              status,
              type,
              message,
              data: data !== undefined ? data : null,
            });
          }

          // If already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return Axios(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          // Mark this request as retried
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshSuccess = await refreshAccessToken();

            if (refreshSuccess) {
              // Token refreshed successfully
              isRefreshing = false;
              processQueue();

              // Retry the original request
              return Axios(originalRequest);
            } else {
              // Refresh failed
              isRefreshing = false;
              processQueue(new Error("Token refresh failed"));

              toast.error("Session expired. Please log in again.");
              useAuthStore.getState().logout();

              return Promise.reject({
                status,
                type,
                message: "Session expired. Please log in again.",
                data: data !== undefined ? data : null,
              });
            }
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError);

            toast.error("Session expired. Please log in again.");
            useAuthStore.getState().logout();

            return Promise.reject({
              status,
              type,
              message: "Session expired. Please log in again.",
              data: data !== undefined ? data : null,
            });
          }
        }

        // Handle other error status codes
        toast.error(message);
      } else if (error.request) {
        message = "Something went wrong. Please try again after some time.";
        toast.error(message);
      } else {
        message = error.message;
        toast.error(message);
      }
    } else {
      message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
    }

    return Promise.reject({
      status,
      type,
      message,
      data: data !== undefined ? data : null,
    } as NormalizedError);
  }
);

export default Axios;
