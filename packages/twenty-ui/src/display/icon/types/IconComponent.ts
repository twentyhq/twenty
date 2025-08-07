import type { CSSProperties, FunctionComponent } from 'react';

export type IconComponentProps = {
  className?: string;
  style?: CSSProperties;
  size?: number | string;
  stroke?: number | string;
  color?: string;
};

export type IconComponent = FunctionComponent<IconComponentProps>;
