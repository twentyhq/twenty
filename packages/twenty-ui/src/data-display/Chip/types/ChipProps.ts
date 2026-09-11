import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type TooltipPosition } from '@ui/surfaces/AppTooltip/AppTooltip';

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
  tooltipPlace?: TooltipPosition;
  alwaysShowTooltip?: boolean;
  isLabelHidden?: boolean;
  forceEmptyText?: boolean;
  emptyLabel?: string;
};
