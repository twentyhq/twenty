import type { ComponentType } from 'react';

import { Money } from '../components/Money';
import { Spaceship } from '../components/Spaceship';
import { Target } from '../components/Target';
import type { HelpedVisualId } from '../types/helped-visual-id';

export const HELPED_VISUALS = {
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<HelpedVisualId, ComponentType>;
