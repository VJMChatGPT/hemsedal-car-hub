import { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      setSession(initialSession);

      if (!initialSession?.user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", initialSession.user.id)
        .maybeSingle();

      if (!isMounted) return;
      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (!isMounted) return;
      setIsAdmin(data?.role === "admin");
      setLoading(false);
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
