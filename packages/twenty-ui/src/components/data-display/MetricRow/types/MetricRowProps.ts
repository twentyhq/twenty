import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type IconComponent } from '@ui/icon';

export type MetricRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  children: string;
  startIcon?: IconComponent;
  value: ReactNode;
  progress?: number;
  progressColor?: string;
  progressValueText?: string;
};
