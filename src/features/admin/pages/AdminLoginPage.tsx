import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { APP_ROUTES } from "@/constants/site";
import { useAdminAuth } from "@/features/admin/hooks/useAdminAuth";

const AdminLoginPage = () => {
  const { isAuthenticated, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("No se pudo iniciar sesion", { description: error.message });
    } else if (!data.session) {
      toast.error("No se pudo iniciar sesion", {
        description: "Supabase no devolvio una sesion valida.",
      });
    } else {
      toast.success("Sesion iniciada");
      navigate(APP_ROUTES.admin, { replace: true });
    }

    setIsSubmitting(false);
  };

  if (!loading && isAuthenticated && isAdmin) {
    return <Navigate to={APP_ROUTES.admin} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Inicia sesion con tu cuenta de administrador.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
