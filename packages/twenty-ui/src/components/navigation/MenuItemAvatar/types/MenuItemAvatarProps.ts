import { type MenuItemAccent } from '@ui/components/navigation/MenuItem/types/MenuItemAccent';
import { type AvatarProps } from '@ui/primitives/data-display/Avatar/types/AvatarProps';
import { type MouseEvent, type ReactNode } from 'react';

export type MenuItemAvatarProps = {
  accent?: MenuItemAccent;
  className?: string;
  iconButtons?: ReactNode;
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  avatar?: Pick<
    AvatarProps,
    'src' | 'colorSeed' | 'name' | 'size' | 'shape'
  > | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: string;
  hasSubMenu?: boolean;
  contextualText?: ReactNode;
};
