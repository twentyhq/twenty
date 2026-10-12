import { type ReactNode } from 'react';

import { type IconButtonSize } from './IconButtonSize';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';

export type IconButtonProps = Omit<
  ButtonProps,
  | 'size'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'startIcon'
  | 'endIcon'
  | 'shortcut'
  | 'shortcutJoinLabel'
  | 'fullWidth'
  | 'loadingPosition'
> & {
  size?: IconButtonSize;
  shape?: 'square' | 'round';
  children: ReactNode;
  tooltip?: string;
  tooltipPlace?: TooltipSide;
  tooltipDelay?: number;
  tooltipOffset?: number;
} & (
    | { 'aria-label': string; 'aria-labelledby'?: string }
    | { 'aria-label'?: string; 'aria-labelledby': string }
  );
