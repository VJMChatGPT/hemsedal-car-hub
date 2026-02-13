import { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveAdminRole = async (userId?: string) => {
      if (!userId) {
        if (!isMounted) return;
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();

        if (error) {
          console.error("No se pudo cargar el perfil de admin", error);
        }

        if (!isMounted) return;
        setIsAdmin(data?.role === "admin");
      } catch (error) {
        console.error("Fallo inesperado validando sesión admin", error);
        if (!isMounted) return;
        setIsAdmin(false);
      }
    };

    const load = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;
        setSession(initialSession);
        await resolveAdminRole(initialSession?.user?.id);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setLoading(true);
      setSession(nextSession);
      await resolveAdminRole(nextSession?.user?.id);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({ session, isAdmin, loading, isAuthenticated: Boolean(session) }),
    [session, isAdmin, loading],
  );
};
