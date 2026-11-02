import { type useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

export type FormFieldRowProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  label?: string;
  startIcon?: ReactNode;
  trailing?: ReactNode;
  trailingProps?: Omit<ComponentProps<'div'>, 'children'>;
  children: ReactNode;
  labelWidth?: CSSProperties['width'];
  contentPaddingInline?: CSSProperties['paddingInline'];
  isHoverable?: boolean;
  hasDivider?: boolean;
};
