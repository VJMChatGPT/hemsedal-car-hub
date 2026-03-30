import { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_AUTH_STORAGE_KEY = "admin-auth-expires-at";
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_ROLE_TIMEOUT_MS = 8_000;

const storeAdminAuthExpiration = () => {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, String(Date.now() + ONE_WEEK_IN_MS));
};

const clearAdminAuthExpiration = () => {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};

const hasValidAdminAuthWindow = () => {
  const expiresAt = Number(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY));
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
};

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
        const { data: isAdminFromRpc, error: rpcError } = await supabase.rpc("is_admin");

        if (!rpcError && typeof isAdminFromRpc === "boolean") {
          if (!isMounted) return;
          setIsAdmin(isAdminFromRpc);
          return;
        }

        if (rpcError) {
          console.error("No se pudo validar admin con RPC, intentando fallback por perfil", rpcError);
        }

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

    const resolveAdminRoleWithTimeout = async (userId?: string) => {
      try {
        await Promise.race([
          resolveAdminRole(userId),
          new Promise((_, reject) =>
            window.setTimeout(() => reject(new Error("Timeout resolviendo rol admin")), ADMIN_ROLE_TIMEOUT_MS),
          ),
        ]);
      } catch (error) {
        console.error("No se pudo resolver rol admin a tiempo", error);
        if (!isMounted) return;
        setIsAdmin(false);
      }
    };

    const applySessionState = async (nextSession: Session | null) => {
      if (!isMounted) return;

      if (nextSession) {
        storeAdminAuthExpiration();
      } else {
        clearAdminAuthExpiration();
      }

      setSession(nextSession);
      await resolveAdminRoleWithTimeout(nextSession?.user?.id);
    };

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          if (!hasValidAdminAuthWindow()) {
            storeAdminAuthExpiration();
          }
        } else {
          clearAdminAuthExpiration();
        }

        if (!isMounted) return;
        setSession(initialSession);
        await resolveAdminRoleWithTimeout(initialSession?.user?.id);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(async () => {
        if (!isMounted) return;
        setLoading(true);
        try {
          await applySessionState(nextSession);
        } catch (error) {
          console.error("Fallo procesando cambio de sesión admin", error);
          if (!isMounted) return;
          setSession(nextSession);
          setIsAdmin(false);
        } finally {
          if (isMounted) setLoading(false);
        }
      }, 0);
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
