import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type TintedIconTileProps = Omit<
  useRender.ComponentProps<'div'>,
  'children' | 'color'
> & {
  icon: ReactNode;
  color?: string | null;
};
