import { type ReactNode } from 'react';
import { type AnimatedButtonBaseProps } from '../internal/AnimatedButtonBaseProps';

export type AnimatedButtonProps = AnimatedButtonBaseProps & {
  animatedSvg: ReactNode;
  soonLabel?: string;
  square?: boolean;
};
