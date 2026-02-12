import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (import.meta.env.MODE === "test" ? "http://localhost:54321" : undefined);
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_KEY ??
  (import.meta.env.MODE === "test" ? "test-publishable-key" : undefined);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase env vars. Define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your environment.",
  );
}

if (import.meta.env.DEV) {
  const maskedKey = `${supabasePublishableKey.slice(0, 8)}…${supabasePublishableKey.slice(-4)}`;
  console.info("[supabase] client initialized", {
    hasUrl: Boolean(supabaseUrl),
    urlHost: new URL(supabaseUrl).host,
    keyPrefix: supabasePublishableKey.slice(0, 8),
    keyMasked: maskedKey,
  });
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
