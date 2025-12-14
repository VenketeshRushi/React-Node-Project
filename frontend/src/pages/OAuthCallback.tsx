import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { AuthServices } from "@/services/auth.services";
import type { NormalizedError } from "@/axios/instance";

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
        // Check for OAuth errors from Google
        const error = searchParams.get("error");
        if (error) {
          const errorMessage =
            error === "access_denied"
              ? ERROR_MESSAGES.ACCESS_DENIED
              : ERROR_MESSAGES.DEFAULT;

          errorToast(errorMessage);

          // Clear PKCE data on error
          sessionStorage.removeItem("pkce_verifier");
          sessionStorage.removeItem("pkce_server_state");

          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Get authorization code and state from URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          errorToast(ERROR_MESSAGES.INVALID_STATE);

          // Clear PKCE data
          sessionStorage.removeItem("pkce_verifier");
          sessionStorage.removeItem("pkce_server_state");

          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Retrieve PKCE data from sessionStorage
        const codeVerifier = sessionStorage.getItem("pkce_verifier");
        const serverState = sessionStorage.getItem("pkce_server_state");

        if (!codeVerifier || !serverState) {
          errorToast(ERROR_MESSAGES.INVALID_STATE);
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Verify state matches (CSRF protection)
        if (state !== serverState) {
          errorToast(ERROR_MESSAGES.INVALID_STATE);

          // Clear invalid PKCE data
          sessionStorage.removeItem("pkce_verifier");
          sessionStorage.removeItem("pkce_server_state");

          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Exchange authorization code for tokens
        const response = await AuthServices.googleCallback({
          code,
          codeVerifier,
          state: serverState,
        });

        // Clear PKCE data after successful API call
        sessionStorage.removeItem("pkce_verifier");
        sessionStorage.removeItem("pkce_server_state");

        if (!response.data.success || !response.data.data) {
          errorToast(ERROR_MESSAGES.SERVER_ERROR);
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Store user in auth store
        setUser(response.data.data);

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const destination = response.data.data.onboarding
          ? "/onboarding"
          : "/dashboard";
        navigate(destination, { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);

        // Clear PKCE data on error
        sessionStorage.removeItem("pkce_verifier");
        sessionStorage.removeItem("pkce_server_state");

        const error = err as NormalizedError;
        let userMessage: string = ERROR_MESSAGES.DEFAULT;

        if (error.status === null) {
          userMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.status && error.status >= 500) {
          userMessage = ERROR_MESSAGES.SERVER_ERROR;
        } else if (error.message) {
          const errorMsg = error.message.toLowerCase();

          if (errorMsg.includes("suspended") || errorMsg.includes("banned")) {
            userMessage = ERROR_MESSAGES.ACCOUNT_SUSPENDED;
          } else if (errorMsg.includes("deleted")) {
            userMessage = ERROR_MESSAGES.ACCOUNT_DELETED;
          } else if (
            errorMsg.includes("expired") ||
            errorMsg.includes("invalid_grant")
          ) {
            userMessage = ERROR_MESSAGES.INVALID_CODE;
          } else if (errorMsg.includes("email")) {
            userMessage = ERROR_MESSAGES.INVALID_EMAIL;
          } else if (
            errorMsg.includes("pkce") ||
            errorMsg.includes("verification")
          ) {
            userMessage = ERROR_MESSAGES.INVALID_STATE;
          } else {
            userMessage = error.message;
          }
        }

        errorToast(userMessage);
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
