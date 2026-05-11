export default function Header() {
  return (
    <header className="border-b border-fox-cream-200 bg-fox-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <TileLogo />
          <div className="leading-tight">
            <div className="font-display text-xl text-fox-navy-700">
              Fox Hill Mahjong
            </div>
            <div className="text-xs uppercase tracking-widest text-fox-yellow-700">
              Summer Sessions
            </div>
          </div>
        </div>
        <nav className="hidden gap-2 sm:flex">
          <button className="btn-ghost" disabled title="Coming soon">
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}

function TileLogo() {
  return (
    <svg
      width="36"
      height="50"
      viewBox="0 0 40 56"
      className="drop-shadow-sm"
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
        stroke="#13294A"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="36"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="22"
        fontWeight="700"
        fill="#B8302A"
      >
        萬
      </text>
    </svg>
  );
}
