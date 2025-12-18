import { useTheme } from '@emotion/react';
import { IconChevronRight, type IconComponent } from '@ui/display';
import { type LightIconButtonProps } from '@ui/input/button/components/LightIconButton';
import { LightIconButtonGroup } from '@ui/input/button/components/LightIconButtonGroup';
import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import styled from '@emotion/styled';
import { MenuItemHotKeys } from '@ui/navigation/menu/menu-item/components/MenuItemHotKeys';
import { motion } from 'framer-motion';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemRightContent,
} from '../internals/components/StyledMenuItemBase';
import { type MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
  ariaLabel?: string;
  dataTestId?: string;
};

export type MenuItemProps = {
  accent?: MenuItemAccent;
  className?: string;
  withIconContainer?: boolean;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  LeftIcon?: IconComponent | null;
  LeftComponent?: ReactNode;
  RightIcon?: IconComponent | null;
  RightComponent?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  disabled?: boolean;
  text: ReactNode;
  contextualTextPosition?: 'left' | 'right';
  contextualText?: ReactNode;
  hasSubMenu?: boolean;
  focused?: boolean;
  hotKeys?: string[];
  isSubMenuOpened?: boolean;
};

const StyledSubMenuIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MenuItem = ({
  accent = 'default',
  className,
  withIconContainer = false,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  LeftComponent,
  RightIcon,
  RightComponent,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  contextualTextPosition = 'left',
  contextualText,
  hasSubMenu = false,
  disabled = false,
  focused = false,
  hotKeys,
  isSubMenuOpened = false,
}: MenuItemProps) => {
  const theme = useTheme();
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={disabled ? undefined : handleMenuItemClick}
      disabled={disabled}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      focused={focused}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon ?? undefined}
        LeftComponent={LeftComponent}
        withIconContainer={withIconContainer}
        text={text}
        contextualText={contextualText}
        contextualTextPosition={contextualTextPosition}
        disabled={disabled}
      />

      <StyledMenuItemRightContent>
        {iconButtons && (
          <div className="hoverable-buttons">
            {showIconButtons && (
              <LightIconButtonGroup iconButtons={iconButtons} size="small" />
            )}
          </div>
        )}
        {hotKeys && <MenuItemHotKeys hotKeys={hotKeys} />}
        {RightIcon && (
          <RightIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {RightComponent}
        {hasSubMenu && !disabled && (
          <StyledSubMenuIcon
            animate={{ rotate: isSubMenuOpened ? 90 : 0 }}
            transition={{ duration: theme.animation.duration.normal }}
          >
            <IconChevronRight
              size={theme.icon.size.sm}
              color={theme.font.color.light}
            />
          </StyledSubMenuIcon>
        )}
      </StyledMenuItemRightContent>
    </StyledHoverableMenuItemBase>
  );
};
