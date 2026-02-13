import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/site";
import { useAdminAuth } from "@/features/admin/hooks/useAdminAuth";

export const AdminRoute = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.adminLogin} replace />;
  }

  if (!isAdmin) {
    return <div className="p-8 text-lg font-semibold">No autorizado</div>;
  }

  return <>{children}</>;
};
