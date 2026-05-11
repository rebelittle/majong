export type SessionType = "mommy" | "beginner" | "experienced";

export interface SessionTemplate {
  type: SessionType;
  title: string;
  tagline: string;
  description: string;
  dayLabel: string;
  timeLabel: string;
  // Used as the tile face on the session card
  glyph: "竹" | "初" | "東";
  glyphColor: string;
}

// Mirrors the seeded `session_templates` rows in the Supabase migration.
// Admin can edit times once the admin UI ships; this is just the default schedule.
export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    type: "mommy",
    title: "Mommy Mahjong",
    tagline: "Play while the kids play",
    description:
      "Childcare provided upstairs and outside — moms get a focused morning of mahjong. All skill levels welcome.",
    dayLabel: "Tuesdays",
    timeLabel: "10:00 – 12:00",
    glyph: "竹",
    glyphColor: "#0F8A5F",
  },
  {
    type: "beginner",
    title: "Beginner Mahjong",
    tagline: "Learn the game from scratch",
    description:
      "Starts with a short teaching segment, then real play with an experienced helper at every table.",
    dayLabel: "Wednesdays",
    timeLabel: "1:00 – 3:00",
    glyph: "初",
    glyphColor: "#B8302A",
  },
  {
    type: "experienced",
    title: "Experienced Players",
    tagline: "Just play",
    description:
      "For players already comfortable with the game. A helper floats around if a rules question comes up.",
    dayLabel: "Thursdays",
    timeLabel: "10:00 – 12:00",
    glyph: "東",
    glyphColor: "#1F5BA8",
  },
];
