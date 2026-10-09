import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type MetricRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  children: ReactNode;
  startIcon?: ReactNode;
  value: ReactNode;
  progress?: number;
  progressColor?: string;
  progressValueText?: string;
};
