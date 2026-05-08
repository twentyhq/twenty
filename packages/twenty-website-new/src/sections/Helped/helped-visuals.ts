import type { ComponentType } from 'react';
import type { MessageDescriptor } from '@lingui/core';
import { Money } from './Money';
import { Spaceship } from './Spaceship';
import { Target } from './Target';

export type HelpedVisualId = 'money' | 'spaceship' | 'target';

export type HeadingCardType = {
  icon: string;
  illustration: HelpedVisualId;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  href: string;
};

export const HELPED_VISUALS = {
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<HelpedVisualId, ComponentType>;
