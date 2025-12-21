import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  useIsAuthenticated,
  useIsOnboardingComplete,
} from "@/stores/auth.store";

const PublicRoute = () => {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const isOnboardingComplete = useIsOnboardingComplete();

  if (isAuthenticated) {
    if (!isOnboardingComplete) {
      return <Navigate to='/onboarding' replace />;
    }

    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
