import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type AnimatedIconCrossfadeProps = Omit<
  useRender.ComponentProps<'span'>,
  'children'
> & {
  isActive: boolean;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
};
