import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type TooltipContentProps = useRender.ComponentProps<'div'> & {
  description?: ReactNode;
  startIcon?: ReactNode;
};
