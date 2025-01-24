import { useTheme } from '@emotion/react';
import { IconChevronRight, IconComponent } from '@ui/display';
import { LightIconButtonProps } from '@ui/input/button/components/LightIconButton';
import { LightIconButtonGroup } from '@ui/input/button/components/LightIconButtonGroup';
import { FunctionComponent, MouseEvent, ReactElement, ReactNode } from 'react';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};

export type MenuItemProps = {
  accent?: MenuItemAccent;
  className?: string;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  LeftIcon?: IconComponent | null;
  RightIcon?: IconComponent | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  disabled?: boolean;
  text: ReactNode;
  contextualText?: ReactNode;
  hasSubMenu?: boolean;
};

export const MenuItem = ({
  accent = 'default',
  className,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  RightIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  contextualText,
  hasSubMenu = false,
  disabled = false,
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
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          LeftIcon={LeftIcon ?? undefined}
          text={text}
          contextualText={contextualText}
        />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <LightIconButtonGroup iconButtons={iconButtons} size="small" />
        )}
      </div>
      {RightIcon && (
        <RightIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      )}
      {hasSubMenu && (
        <IconChevronRight
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
