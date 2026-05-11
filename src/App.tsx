import Header from "./components/Header";
import SessionCard from "./components/SessionCard";
import { SESSION_TEMPLATES } from "./data/sessionTemplates";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <section className="card mb-10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-fox-yellow-700">
            Summer 2026
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            Weekly Mahjong at Fox Hill School
          </h1>
          <p className="mt-4 max-w-2xl text-fox-ink/80">
            Three friendly sessions a week, all summer long. Pick a session,
            grab your seat, and see who's sitting at your table. An advanced
            player floats around every game to help when you need it.
          </p>
        </section>

        <h2 className="mb-4 text-xl">This week's sessions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SESSION_TEMPLATES.map((s) => (
            <SessionCard key={s.type} template={s} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-fox-ink/60">
          Profile creation and seat booking coming soon.
        </p>
      </main>
    </div>
  );
}
