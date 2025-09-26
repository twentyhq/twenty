import { useTheme } from '@emotion/react';

import { IconChevronRight, type IconComponent } from '@ui/display';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  withIconContainer = false,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          LeftIcon={LeftIcon}
          text={text}
          withIconContainer={withIconContainer}
        />
      </StyledMenuItemLeftContent>
      <IconChevronRight
        size={theme.icon.size.sm}
        color={theme.font.color.tertiary}
      />
    </StyledMenuItemBase>
  );
};
