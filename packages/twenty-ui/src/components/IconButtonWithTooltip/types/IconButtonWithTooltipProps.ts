import { type IconButtonProps } from '@ui/primitives/input/IconButton/types/IconButtonProps';
import {
  type TooltipDelay,
  type TooltipPosition,
} from '@ui/primitives/surfaces';

export type IconButtonWithTooltipProps = IconButtonProps & {
  tooltipContent: string;
  tooltipPlace?: TooltipPosition;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};
