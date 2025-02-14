import { FunctionComponent } from 'react';

export type IconComponentProps = {
  className?: string;
  size?: number;
  stroke?: number;
  color?: string;
};

export type IconComponent = FunctionComponent<IconComponentProps>;
