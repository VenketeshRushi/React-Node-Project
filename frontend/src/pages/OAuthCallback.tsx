import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { AuthServices } from "@/services/auth.services";
import type { NormalizedError } from "@/axios/instance";
import { delay } from "@/utils/ext";

const ERROR_MESSAGES = {
  ACCESS_DENIED: "You cancelled the sign-in process. Please try again.",
  INVALID_STATE:
    "Security verification failed. Please start the sign-in process again.",
  INVALID_CODE: "Authentication session expired. Please try signing in again.",
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your connection and try again.",
  SERVER_ERROR: "Something went wrong. Please try again in a moment.",
  ACCOUNT_SUSPENDED:
    "Your account has been suspended. Please contact support for assistance.",
  ACCOUNT_DELETED:
    "This account has been deleted. Contact support if you need help restoring it.",
  INVALID_EMAIL:
    "The email provided by Google is invalid. Please try a different account.",
  DEFAULT: "We couldn't complete the sign-in. Please try again.",
} as const;

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { errorToast } = useToast();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get("error");

        if (error) {
          errorToast(
            error === "access_denied"
              ? ERROR_MESSAGES.ACCESS_DENIED
              : ERROR_MESSAGES.DEFAULT
          );
          sessionStorage.clear();
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          errorToast(ERROR_MESSAGES.INVALID_STATE);
          sessionStorage.clear();
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        const codeVerifier = sessionStorage.getItem("pkce_verifier");
        const storedState = sessionStorage.getItem("pkce_state");

        if (!codeVerifier || state !== storedState) {
          errorToast(ERROR_MESSAGES.INVALID_STATE);
          sessionStorage.clear();
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        const response = await AuthServices.googleCallback({
          code,
          codeVerifier,
        });

        sessionStorage.clear();

        if (!response.success || !response.data) {
          errorToast(ERROR_MESSAGES.SERVER_ERROR);
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        setUser(response.data);
        await delay(200);

        navigate(response.data.onboarding ? "/onboarding" : "/dashboard", {
          replace: true,
        });
      } catch (err) {
        sessionStorage.clear();

        const error = err as NormalizedError;
        let message: string = ERROR_MESSAGES.DEFAULT;

        if (error.status === null) {
          message = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.status && error.status >= 500) {
          message = ERROR_MESSAGES.SERVER_ERROR;
        } else if (error.message) {
          message = error.message;
        }

        errorToast(message);
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, errorToast, setUser]);

  return (
    <div className='min-h-screen w-full flex items-center justify-center px-4 bg-background'>
      <Spinner />
    </div>
  );
}
