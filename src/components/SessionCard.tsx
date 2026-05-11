import type { SessionTemplate } from "../data/sessionTemplates";

interface Props {
  template: SessionTemplate;
}

export default function SessionCard({ template }: Props) {
  // Placeholder until Supabase wires in real counts.
  const seatsTaken = 0;
  const seatsTotal = 20;

  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="flex items-start gap-3 border-b border-fox-cream-200 p-5">
        <SessionTile glyph={template.glyph} color={template.glyphColor} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg">{template.title}</h3>
          <p className="text-sm text-fox-ink/70">{template.tagline}</p>
        </div>
      </div>

      <div className="flex-1 p-5">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-fox-navy-700">
          <span>{template.dayLabel}</span>
          <span aria-hidden className="text-fox-ink/30">
            •
          </span>
          <span>{template.timeLabel}</span>
        </div>
        <p className="text-sm text-fox-ink/80">{template.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-fox-cream-200 bg-fox-cream-50/60 px-5 py-3">
        <span className="text-sm text-fox-ink/70">
          <span className="font-semibold text-fox-navy-700">{seatsTaken}</span>
          {" / "}
          {seatsTotal} seats
        </span>
        <button className="btn-primary" disabled title="Coming soon">
          Pick a seat
        </button>
      </div>
    </article>
  );
}

function SessionTile({ glyph, color }: { glyph: string; color: string }) {
  return (
    <svg
      width="44"
      height="60"
      viewBox="0 0 40 56"
      className="shrink-0 drop-shadow-sm"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="54"
        rx="6"
        ry="6"
        fill="#FBF3DA"
        stroke="#A6916A"
        strokeWidth="1"
      />
      <rect
        x="3"
        y="3"
        width="34"
        height="50"
        rx="4.5"
        ry="4.5"
        fill="none"
        stroke="#D9C696"
        strokeWidth="0.6"
      />
      <text
        x="20"
        y="36"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="22"
        fontWeight="700"
        fill={color}
      >
        {glyph}
      </text>
    </svg>
  );
}
