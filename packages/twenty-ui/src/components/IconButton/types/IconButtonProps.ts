import { type ReactNode } from 'react';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';

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
  tooltipPlace?: TooltipSide;
  tooltipDelay?: number;
  tooltipOffset?: number;
};
