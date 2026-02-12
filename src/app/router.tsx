import { BrowserRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "@/constants/site";
import HomePage from "@/pages/Index";
import NotFoundPage from "@/pages/NotFound";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path={APP_ROUTES.home} element={<HomePage />} />
      <Route path={APP_ROUTES.fallback} element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
