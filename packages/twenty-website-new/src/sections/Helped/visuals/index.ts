import type { ComponentType } from 'react';
import type { HelpedVisualId } from '@/sections/Helped/types/HeadingCard';
import { Money } from './Money';
import { Spaceship } from './Spaceship';
import { Target } from './Target';

/**
 * Local visual map for the Helped section. Each card's data references
 * a visual by string id; this map resolves the id to the React
 * component to render. Keeping the map next to the section that owns
 * the visuals (rather than in a global registry) means each scene's
 * Three.js bundle is only pulled in by routes that actually render the
 * Helped section.
 */
export const HELPED_VISUALS = {
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<HelpedVisualId, ComponentType>;
