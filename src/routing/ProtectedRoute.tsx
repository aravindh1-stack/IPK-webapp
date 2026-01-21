import { JSX } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "@/context/AuthContex";

type Props = {
  children?: JSX.Element;
  allow?: Role[];
};

export default function ProtectedRoute({ children, allow }: Props) {
  const { firebaseUser, user, loading } = useAuth();
  const loc = useLocation();

  // While auth bootstraps, don't redirect
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-medium text-gray-600">
        Loading…
      </div>
    );
  }

  // Not signed in → go to signin
  if (!firebaseUser) {
    return <Navigate to="/signin" state={{ from: loc }} replace />;
  }

  // Role-gated guard
  if (allow && (!user || !allow.includes(user.role as Role))) {
    console.error("🚫 Access Denied:", {
      requiredRoles: allow,
      userRole: user?.role || "NO_USER",
      userEmail: user?.email || "NO_EMAIL",
      path: loc.pathname,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // Support both wrapper and element usage
  return children ?? <Outlet />;
}
