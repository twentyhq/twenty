import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type StackIconProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  icon: ReactNode;
  stackedIcon: ReactNode;
};
