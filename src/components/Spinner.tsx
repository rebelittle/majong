import { useEffect, useState } from "react";

interface Props {
  label?: string;
  // When true (default), shows a "Reset session" escape hatch after a few seconds
  // so a stuck auth load is never a dead end.
  escapeHatch?: boolean;
}

export default function Spinner({ label = "Loading…", escapeHatch = true }: Props) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!escapeHatch) return;
    const t = setTimeout(() => setStuck(true), 4500);
    return () => clearTimeout(t);
  }, [escapeHatch]);

  function resetSession() {
    try { localStorage.clear(); } catch { /* private mode */ }
    try { sessionStorage.clear(); } catch { /* private mode */ }
    window.location.href = import.meta.env.BASE_URL;
  }

  return (
    <main className="grid min-h-[60vh] place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-fox-yellow-500/30 border-t-fox-yellow-500" />
        <p className="text-sm text-fox-ink/60">{label}</p>
        {escapeHatch && stuck && (
          <div className="mt-10">
            <p className="text-xs text-fox-ink/55">Taking longer than it should?</p>
            <button onClick={resetSession} className="btn-ghost mt-3 text-sm">
              Reset session and start over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
