import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

// After Supabase exchanges the magic-link code for a session (handled
// automatically by `detectSessionInUrl: true`), the AuthContext fires
// onAuthStateChange. We just wait for that, then route accordingly:
//   - no profile yet → /profile (force them to create one)
//   - has profile    → /
export default function AuthCallbackPage() {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    navigate(profile ? "/" : "/profile", { replace: true });
  }, [loading, user, profile, navigate]);

  return (
    <main className="grid min-h-[60vh] place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-fox-yellow-500/30 border-t-fox-yellow-500" />
        <p className="text-sm text-fox-ink/60">Signing you in…</p>
      </div>
    </main>
  );
}
