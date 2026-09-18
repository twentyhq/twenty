import { type IconComponent } from '@ui/icon';
import { type MouseEvent } from 'react';

export type MenuItemSuggestionProps = {
  LeftIcon?: IconComponent | null;
  withIconContainer?: boolean;
  text: string;
  contextualText?: string;
  contextualTextPosition?: 'left' | 'right';
  selected?: boolean;
  className?: string;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
};
