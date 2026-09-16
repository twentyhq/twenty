import { type ReactNode } from 'react';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import {
  type TooltipDelay,
  type TooltipPosition,
} from '@ui/primitives/surfaces/AppTooltip/AppTooltip';

export type IconButtonProps = Omit<
  ButtonProps,
  | 'aria-label'
  | 'children'
  | 'startIcon'
  | 'endIcon'
  | 'hotkeys'
  | 'fullWidth'
  | 'soon'
  | 'soonLabel'
> & {
  children: ReactNode;
  'aria-label': string;
  tooltip?: string;
  tooltipPlace?: TooltipPosition;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};
