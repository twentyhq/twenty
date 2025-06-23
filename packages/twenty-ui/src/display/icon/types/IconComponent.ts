import { FunctionComponent } from 'react';
import * as React from 'react';

export type IconComponentProps = {
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
  stroke?: number | string;
  color?: string;
};

export type IconComponent = FunctionComponent<IconComponentProps>;
