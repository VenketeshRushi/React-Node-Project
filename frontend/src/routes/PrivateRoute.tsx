import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const PrivateRoute = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (user?.onboarding && location.pathname !== "/onboarding") {
    return <Navigate to='/onboarding' replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
