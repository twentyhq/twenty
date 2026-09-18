import { type MenuItemAccent } from '@ui/components/MenuItem/types/MenuItemAccent';
import { type MenuItemDraggableGripMode } from '@ui/components/MenuItem/types/MenuItemDraggableGripMode';
import { type MenuItemIconButton } from '@ui/components/MenuItem/types/MenuItemIconButton';
import { type IconComponent } from '@ui/icon';
import { type ReactNode } from 'react';

export type MenuItemDraggableProps = {
  LeftIcon?: IconComponent | undefined;
  withIconContainer?: boolean;
  accent?: MenuItemAccent;
  iconButtons?: MenuItemIconButton[];
  isTooltipOpen?: boolean;
  onClick?: () => void;
  text: ReactNode;
  contextualText?: ReactNode;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  gripMode?: MenuItemDraggableGripMode;
  isDragDisabled?: boolean;
  isHoverDisabled?: boolean;
};
