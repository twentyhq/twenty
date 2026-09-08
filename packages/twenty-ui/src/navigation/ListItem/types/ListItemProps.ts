import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type ListItemColor } from './ListItemColor';
import { type ListItemDescriptionPlacement } from './ListItemDescriptionPlacement';
import { type ListItemIndicator } from './ListItemIndicator';
import { type ListItemState } from './ListItemState';

export type ListItemProps = Omit<
  useRender.ComponentProps<'div', ListItemState>,
  'color'
> & {
  color?: ListItemColor;
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  indicator?: ListItemIndicator;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  description?: ReactNode;
  descriptionPlacement?: ListItemDescriptionPlacement;
  actions?: ReactNode;
  hotkeys?: string[];
  submenu?: boolean;
};
