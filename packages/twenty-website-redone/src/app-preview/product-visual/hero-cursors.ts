import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

export type HeroCursorCoordinate = { left: number; top: number };

export type HeroCursorConfig = {
  color: string;
  home: HeroCursorCoordinate;
  // Resting position on the phone bleed layout, where the window runs
  // off the right edge; defaults to home when unset.
  mobileHome?: HeroCursorCoordinate;
  name: string;
};

const inks = APP_PREVIEW_TONES.productVisual.heroCursorInks;

// The three collaborators touring the record (authored colors/positions).
export const HERO_CURSORS: HeroCursorConfig[] = [
  {
    name: 'Alice',
    color: inks.alice,
    home: { left: 13, top: 34 },
    mobileHome: { left: 13, top: -6 },
  },
  { name: 'Ben', color: inks.ben, home: { left: 36, top: 90 } },
  { name: 'Cara', color: inks.cara, home: { left: 90, top: 51 } },
];
