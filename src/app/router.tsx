import { BrowserRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "@/constants/site";
import HomePage from "@/pages/Index";
import NotFoundPage from "@/pages/NotFound";
import AdminLoginPage from "@/features/admin/pages/AdminLoginPage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import { AdminRoute } from "@/features/admin/components/AdminRoute";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path={APP_ROUTES.home} element={<HomePage />} />
      <Route path={APP_ROUTES.adminLogin} element={<AdminLoginPage />} />
      <Route
        path={APP_ROUTES.admin}
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route path={APP_ROUTES.fallback} element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
