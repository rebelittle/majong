import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function LoginPage() {
  const { user, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrMsg("");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setStatus("error");
      setErrMsg(error);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-14 sm:px-6">
      <div className="card relative overflow-hidden p-7 sm:p-9">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rotate-12 rounded-3xl bg-fox-yellow-500/10 blur-2xl" />
        <p className="pill">Sign in</p>
        <h1 className="mt-3 text-3xl">Welcome.</h1>
        <p className="mt-2 text-fox-ink/75">
          We'll email you a one-tap link — no password needed.
        </p>

        {status === "sent" ? (
          <div className="mt-7 rounded-xl border border-fox-yellow-500/40 bg-fox-yellow-500/10 p-4 text-sm">
            <p className="font-semibold text-fox-navy-700">Check your email.</p>
            <p className="mt-1 text-fox-ink/75">
              We sent a magic link to <span className="font-medium">{email}</span>. Open it
              on this device to finish signing in. (Check spam if it doesn't arrive in a
              minute.)
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="label">Your email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                disabled={status === "sending"}
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-tile-red">{errMsg || "Something went wrong, try again."}</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending link…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-fox-ink/55">
          By signing in you agree to be charmingly present at one of the three weekly
          Mahjong sessions at Fox Hill School.
        </p>
      </div>
    </main>
  );
}
