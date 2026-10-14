import { type useRender } from '@base-ui/react/use-render';
import { type MouseEvent, type ReactNode } from 'react';

import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';
import { type TextTruncationProps } from '@ui/primitives/typography/Text/internal/TextTruncationProps';

export type OverflowingTextWithTooltipProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> &
  TextTruncationProps & {
    withTooltip?: boolean;
    isTooltipMultiline?: boolean;
    tooltipDelay?: number;
    tooltipPlace?: TooltipSide;
    alwaysShowTooltip?: boolean;
    initialPointerPosition?: Pick<MouseEvent, 'clientX' | 'clientY'>;
    isFocusable?: boolean;
  } & (
    | {
        text: string | null | undefined;
        tooltipContent?: string;
      }
    | {
        text: Exclude<ReactNode, string | null | undefined>;
        tooltipContent: string;
      }
  );
