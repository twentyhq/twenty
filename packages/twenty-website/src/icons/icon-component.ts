import { type ComponentType } from 'react';

// The shape every icon slot accepts: tabler icons and our authored marks
// both satisfy it.
export type IconComponent = ComponentType<{
  size?: number;
  'aria-hidden'?: boolean;
}>;
