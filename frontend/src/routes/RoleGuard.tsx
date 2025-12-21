import { Navigate } from "react-router-dom";
import { useUser } from "@/stores/auth.store";

interface RoleGuardProps {
  allowedRoles: Array<"user" | "admin" | "superadmin">;
  children: React.ReactNode;
  fallbackPath?: string;
}

const RoleGuard = ({
  allowedRoles,
  children,
  fallbackPath = "/dashboard",
}: RoleGuardProps) => {
  const user = useUser();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
