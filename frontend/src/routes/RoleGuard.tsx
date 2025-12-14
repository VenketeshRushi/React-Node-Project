import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

interface RoleGuardProps {
  allowedRoles: Array<"user" | "admin" | "superadmin">;
  children: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
