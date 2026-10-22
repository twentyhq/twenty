import { type useRender } from '@base-ui/react/use-render';
import { type CSSProperties, type ReactNode } from 'react';

export type FormFieldRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  label?: string;
  startIcon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  labelWidth?: CSSProperties['width'];
  isHoverable?: boolean;
  hasDivider?: boolean;
};
