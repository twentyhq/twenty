import { FunctionComponent } from 'react';

export type IconComponent = FunctionComponent<{
  className?: string;
  color?: string;
  size?: number;
  stroke?: number;
}>;
