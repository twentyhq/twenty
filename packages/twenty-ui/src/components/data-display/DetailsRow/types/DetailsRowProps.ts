import { type useRender } from '@base-ui/react/use-render';
import { type CSSProperties, type ReactNode } from 'react';

export type DetailsRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  label: ReactNode;
  children: ReactNode;
  startIcon?: ReactNode;
  action?: ReactNode;
  labelWidth?: CSSProperties['width'];
};
