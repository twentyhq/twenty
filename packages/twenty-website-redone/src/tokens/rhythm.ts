export type RhythmStep = { base: number; md: number };

export type RhythmClass = { top: RhythmStep; bottom: RhythmStep };

// Inter-section vertical rhythm, in spacing multipliers. Sections take their
// vertical padding from these named classes — never their own numbers.
// (The old site's hero bottom never scaled past mobile; here it does.)
export const RHYTHM: Record<
  'section' | 'hero' | 'spacious' | 'flush',
  RhythmClass
> = {
  section: {
    top: { base: 12, md: 16 },
    bottom: { base: 12, md: 16 },
  },
  hero: {
    top: { base: 7.5, md: 12 },
    bottom: { base: 6, md: 8 },
  },
  // Scroll scenes own their height entirely (Helped's 280vh stage).
  flush: {
    top: { base: 0, md: 0 },
    bottom: { base: 0, md: 0 },
  },
  // Full-bleed dark closers (FAQ) breathe wider than standard sections.
  spacious: {
    top: { base: 30, md: 30 },
    bottom: { base: 30, md: 30 },
  },
};
