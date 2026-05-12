import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile } from "./database.types";

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) {
        console.error("Profile fetch error:", error.message);
        setProfile(null);
        return;
      }
      setProfile((data as Profile | null) ?? null);
    } catch (err) {
      // Network error or similar — don't let it crash AuthContext init.
      console.error("Profile fetch threw:", err);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Hard cap on getSession so a hung promise can't trap the UI forever.
        // If it doesn't resolve in 8s, treat as unauthenticated. Real session
        // restoration happens in localStorage; this just stops the UI hanging.
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: Session | null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 8000),
          ),
        ]);
        if (!mounted) return;
        setSession(sessionResult.data.session);
        if (sessionResult.data.session?.user) {
          await loadProfile(sessionResult.data.session.user.id);
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        // Always flip loading off so RequireAuth never gets stuck.
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    async signInWithEmail(email) {
      // Redirect target must be a plain non-hash URL — Supabase appends `?code=`
      // and `detectSessionInUrl` in the client picks it up on load. With
      // HashRouter we then route to /profile or / from inside React.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async refreshProfile() {
      if (session?.user) await loadProfile(session.user.id);
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
