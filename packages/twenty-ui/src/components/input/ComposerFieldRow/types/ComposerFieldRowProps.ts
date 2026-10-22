import { type useRender } from '@base-ui/react/use-render';
import { type CSSProperties, type ReactNode } from 'react';

export type ComposerFieldRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  label?: string;
  startIcon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  labelWidth?: CSSProperties['width'];
  hoverable?: boolean;
  divider?: boolean;
};
