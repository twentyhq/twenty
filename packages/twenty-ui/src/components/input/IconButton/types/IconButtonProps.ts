import { type ReactNode } from 'react';

import { type IconButtonSize } from './IconButtonSize';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';

export type IconButtonProps = Omit<
  ButtonProps,
  | 'size'
  | 'aria-label'
  | 'children'
  | 'startIcon'
  | 'endIcon'
  | 'hotkeys'
  | 'fullWidth'
  | 'soon'
  | 'soonLabel'
> & {
  size?: IconButtonSize;
  shape?: 'square' | 'round';
  children: ReactNode;
  'aria-label': string;
  tooltip?: string;
  tooltipPlace?: TooltipSide;
  tooltipDelay?: number;
  tooltipOffset?: number;
};
