import axios, { type AxiosResponse } from "axios";
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

Axios.interceptors.request.use(config => config);

Axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error): Promise<NormalizedError> => {
    let status: number | null = null;
    let type: string | null = null;
    let message = "Network Error";
    let data: unknown = undefined;
    console.log(error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        status = error.response.status;
        const responseData = error.response.data.error as ApiErrorResponse;

        type = responseData?.type ?? null;
        message =
          responseData?.message ?? STATUS_MESSAGES[status] ?? `Error ${status}`;

        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          useAuthStore.getState().logout();
          return Promise.reject({
            status,
            type,
            message: "Session expired. Please log in again.",
          });
        }

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
    });
  }
);

export default Axios;
