import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type IconComponent } from '@ui/icon';

export type MetricRowProps = useRender.ComponentProps<'div'> & {
  startIcon?: IconComponent;
  value: ReactNode;
  progress?: number;
  progressColor?: string;
};
