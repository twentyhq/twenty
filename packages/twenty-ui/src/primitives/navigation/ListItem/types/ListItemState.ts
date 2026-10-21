import { type ListItemColor } from './ListItemColor';
import { type ListItemIndicator } from './ListItemIndicator';

export type ListItemState = {
  color: ListItemColor;
  indicator: ListItemIndicator;
  selected: boolean;
  active: boolean;
  highlighted: boolean;
  disabled: boolean;
};
