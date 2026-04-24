import type { ComponentType } from 'react';
import type { HelpedVisualId } from '@/sections/Helped/types/HeadingCard';
import { Money } from './Money';
import { Spaceship } from './Spaceship';
import { Target } from './Target';

export const HELPED_VISUALS = {
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<HelpedVisualId, ComponentType>;
