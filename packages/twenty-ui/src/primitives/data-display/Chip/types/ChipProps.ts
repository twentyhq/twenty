import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type OverflowingTextWithTooltipProps } from '@ui/primitives/typography/OverflowingTextWithTooltip/types/OverflowingTextWithTooltipProps';

import { type ChipSize } from './ChipSize';
import { type ChipVariant } from './ChipVariant';

export type ChipProps = Omit<useRender.ComponentProps<'div'>, 'color'> &
  Pick<
    OverflowingTextWithTooltipProps,
    | 'truncate'
    | 'tooltipContent'
    | 'tooltipDelay'
    | 'tooltipPlace'
    | 'isTooltipMultiline'
    | 'alwaysShowTooltip'
  > & {
    size?: ChipSize;
    variant?: ChipVariant;
    color?: 'primary' | 'secondary';
    shape?: 'square' | 'round';
    weight?: 'regular' | 'medium';
    clickable?: boolean;
    startElement?: ReactNode;
    endElement?: ReactNode;
    endElementDivider?: boolean;
    maxWidth?: number;
  };
