import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type TooltipBodyProps = useRender.ComponentProps<'div'> & {
  description?: ReactNode;
  startIcon?: ReactNode;
};
