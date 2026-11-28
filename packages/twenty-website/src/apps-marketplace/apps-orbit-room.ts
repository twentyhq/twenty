import { HERO_COMPOSITION } from '@/tokens/hero-composition';
import { RHYTHM } from '@/tokens/rhythm';
import { spacing } from '@/tokens/spacing';

// The room AppsHero leaves under its buttons for the orbit: what brings the
// hero to the shared height under the actions (HERO_COMPOSITION).
export const APPS_ORBIT_ROOM: { base: string; md: string } = {
  base: `calc(${HERO_COMPOSITION.belowActionsPx}px - ${spacing(RHYTHM.hero.bottom.base)})`,
  md: `calc(${HERO_COMPOSITION.belowActionsPx}px - ${spacing(RHYTHM.hero.bottom.md)})`,
};
