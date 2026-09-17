import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';

import { type ChipSize } from './ChipSize';
import { type ChipVariant } from './ChipVariant';

export type ChipProps = Omit<useRender.ComponentProps<'div'>, 'color'> & {
  size?: ChipSize;
  variant?: ChipVariant;
  color?: 'primary' | 'secondary';
  shape?: 'square' | 'round';
  weight?: 'regular' | 'medium';
  disabled?: boolean;
  clickable?: boolean;
  nativeButton?: boolean;
  startElement?: ReactNode;
  endElement?: ReactNode;
  endElementDivider?: boolean;
  maxWidth?: number;
  tooltipLabel?: string;
  tooltipPlace?: TooltipSide;
  alwaysShowTooltip?: boolean;
  isLabelHidden?: boolean;
  forceEmptyText?: boolean;
  emptyLabel?: string;
};
