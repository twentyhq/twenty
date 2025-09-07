import { useTheme } from '@emotion/react';
import { i18n } from '@lingui/core';
import { isRtlLocale } from 'twenty-shared/utils';

import { IconChevronLeft, IconChevronRight, type IconComponent } from '@ui/display';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  const theme = useTheme();
  const ChevronIcon = isRtlLocale(i18n.locale) ? IconChevronLeft : IconChevronRight;

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      </StyledMenuItemLeftContent>
      <ChevronIcon size={theme.icon.size.sm} color={theme.font.color.tertiary} />
    </StyledMenuItemBase>
  );
};
