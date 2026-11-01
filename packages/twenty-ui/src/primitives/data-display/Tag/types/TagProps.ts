import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type TagColor } from './TagColor';
import { type TagState } from './TagState';

export type TagProps = Omit<
  useRender.ComponentProps<'span', TagState>,
  'color'
> &
  Partial<TagState> & {
    color: TagColor;
    startIcon?: ReactNode;
    borderStyle?: 'solid' | 'dashed';
  };
