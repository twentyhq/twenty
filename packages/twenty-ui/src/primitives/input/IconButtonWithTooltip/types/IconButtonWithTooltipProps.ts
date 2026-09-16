import type { IconButtonProps } from '@ui/primitives/input/IconButton/types/IconButtonProps';
import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';

export type IconButtonWithTooltipProps = Pick<
  IconButtonProps,
  'Icon' | 'ariaLabel' | 'onClick' | 'size' | 'variant' | 'disabled'
> & {
  tooltipContent: string;
  tooltipPlace?: TooltipSide;
  tooltipDelay?: number;
  tooltipOffset?: number;
};
