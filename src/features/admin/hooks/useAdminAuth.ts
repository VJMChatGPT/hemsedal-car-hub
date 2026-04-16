import { useEffect, useMemo, useRef, useState } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_AUTH_STORAGE_KEY = "admin-auth-expires-at";
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_AUTH_TIMEOUT_MS = 8_000;

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

const withTimeout = async <T,>(promise: Promise<T>, label: string) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out`)), ADMIN_AUTH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const useAdminAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const resolveAdminRole = async (userId?: string) => {
      if (!userId) {
        return false;
      }

      try {
        const { data: isAdminFromRpc, error: rpcError } = await withTimeout(
          supabase.rpc("is_admin"),
          "Supabase admin RPC",
        );

        if (!rpcError && typeof isAdminFromRpc === "boolean") {
          return isAdminFromRpc;
        }

        if (rpcError) {
          console.error("No se pudo validar admin con RPC, intentando fallback por perfil", rpcError);
        }
      } catch (error) {
        console.error("No se pudo validar admin con RPC, intentando fallback por perfil", error);
      }

      try {
        const { data, error } = await withTimeout(
          supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
          "Supabase admin profile lookup",
        );

        if (error) {
          console.error("No se pudo cargar el perfil de admin", error);
        }

        return data?.role === "admin";
      } catch (error) {
        console.error("Fallo inesperado validando sesion admin", error);
        return false;
      }
    };

    const applySession = async (nextSession: Session | null) => {
      const requestId = ++requestIdRef.current;

      if (isMounted) {
        setLoading(true);
      }

      try {
        if (nextSession) {
          if (!hasValidAdminAuthWindow()) {
            storeAdminAuthExpiration();
          }
        } else {
          clearAdminAuthExpiration();
        }

        const nextIsAdmin = await resolveAdminRole(nextSession?.user?.id);

        if (!isMounted || requestId !== requestIdRef.current) return;
        setSession(nextSession);
        setIsAdmin(nextIsAdmin);
      } finally {
        if (isMounted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    const load = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await withTimeout(supabase.auth.getSession(), "Supabase auth session lookup");

        await applySession(initialSession);
      } catch (error) {
        console.error("No se pudo cargar la sesion admin", error);

        if (!isMounted) return;
        clearAdminAuthExpiration();
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      setTimeout(() => {
        if (isMounted) {
          void applySession(nextSession);
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
