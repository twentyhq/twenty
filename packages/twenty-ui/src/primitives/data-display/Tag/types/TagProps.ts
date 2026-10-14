import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';
import { type OverflowingTextWithTooltipProps } from '@ui/primitives/typography/OverflowingTextWithTooltip/types/OverflowingTextWithTooltipProps';

import { type TagColor } from './TagColor';
import { type TagState } from './TagState';

export type TagProps = Omit<
  useRender.ComponentProps<'span', TagState>,
  'color'
> &
  Partial<TagState> &
  Pick<
    OverflowingTextWithTooltipProps,
    'withTooltip' | 'measureOverflowOnOpen' | 'initialPointerPosition'
  > & {
    color: TagColor;
    startIcon?: ReactNode;
    borderStyle?: 'solid' | 'dashed';
  };
