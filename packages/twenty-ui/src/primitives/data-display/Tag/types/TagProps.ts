import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type TagColor } from './TagColor';

export type TagProps = Omit<useRender.ComponentProps<'span'>, 'color'> & {
  color: TagColor;
  weight?: 'regular' | 'medium';
  disabled?: boolean;
  nativeButton?: boolean;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  startIcon?: ReactNode;
  preventShrink?: boolean;
  preventPadding?: boolean;
  borderStyle?: 'solid' | 'dashed';
};
