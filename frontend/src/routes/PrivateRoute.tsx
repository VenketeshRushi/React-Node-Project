import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, useUser, useIsAuthenticated } from "@/stores/auth.store";

const PrivateRoute = () => {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const { isOnboardingComplete } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (!isOnboardingComplete() && location.pathname !== "/onboarding") {
    return <Navigate to='/onboarding' replace />;
  }

  if (isOnboardingComplete() && location.pathname === "/onboarding") {
    return <Navigate to='/dashboard' replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
