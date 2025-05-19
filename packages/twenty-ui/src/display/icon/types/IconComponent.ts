import { FunctionComponent } from 'react';

export type IconComponentProps = {
  className?: string;
  size?: number | string;
  stroke?: number | string;
  color?: string;
};

export type IconComponent = FunctionComponent<IconComponentProps>;
