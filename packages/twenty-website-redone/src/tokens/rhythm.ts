export type RhythmStep = { base: number; md: number };

export type RhythmClass = { top: RhythmStep; bottom: RhythmStep };

// Inter-section vertical rhythm, in spacing multipliers. Sections take their
// vertical padding from these named classes — never their own numbers.
// (The old site's hero bottom never scaled past mobile; here it does.)
export const RHYTHM: Record<'section' | 'hero', RhythmClass> = {
  section: {
    top: { base: 12, md: 16 },
    bottom: { base: 12, md: 16 },
  },
  hero: {
    top: { base: 7.5, md: 12 },
    bottom: { base: 6, md: 8 },
  },
};
