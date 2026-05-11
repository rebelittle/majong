import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surface this loudly during development; the deployed build sets these via
  // GitHub Actions secrets so prod should never hit this.
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in the values from your Supabase project.",
  );
}

export const supabase = createClient<Database>(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Typed RPC helper. supabase-js v2.105's rpc() generic inference fights us
// (defaults Args to `never`); this wrapper threads the Database types
// through explicitly so callers get full type safety.
type Fns = Database["public"]["Functions"];
export async function rpc<N extends keyof Fns>(
  name: N,
  args: Fns[N]["Args"],
): Promise<Fns[N]["Returns"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)(name, args);
  if (error) throw error;
  return data as Fns[N]["Returns"];
}
