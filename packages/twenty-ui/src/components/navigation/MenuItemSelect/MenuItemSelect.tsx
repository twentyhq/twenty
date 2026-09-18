import { isString } from '@sniptt/guards';
import { MenuItemLeftContent } from '@ui/components/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemLabel,
  StyledMenuItemRightContent,
  StyledRightMenuItemContextualText,
} from '@ui/components/navigation/MenuItem/parts/StyledMenuItemBase';
import { OverflowingTextWithTooltip } from '@ui/components/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { IconCheck, IconChevronRight, type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { type ReactNode } from 'react';
import { StyledMenuItemSelect } from './internal/StyledMenuItemSelect';

type MenuItemSelectProps = {
  LeftComponent?: ReactNode;
  LeftIcon?: IconComponent | null | undefined;
  leftIconColor?: ThemeColor | null;
  withIconContainer?: boolean;
  selected: boolean;
  needIconCheck?: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  hasSubMenu?: boolean;
  contextualText?: ReactNode;
  contextualTextPosition?: 'left' | 'right';
};

export const MenuItemSelect = ({
  LeftComponent,
  LeftIcon,
  leftIconColor,
  withIconContainer = false,
  text,
  selected,
  needIconCheck = true,
  className,
  onClick,
  disabled,
  focused,
  hasSubMenu = false,
  contextualText,
  contextualTextPosition = 'left',
}: MenuItemSelectProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      disabled={disabled}
      focused={focused}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
    >
      <MenuItemLeftContent
        LeftComponent={LeftComponent}
        LeftIcon={LeftIcon}
        iconThemeColor={leftIconColor}
        text={text}
        contextualText={
          contextualTextPosition === 'left' ? contextualText : null
        }
        withIconContainer={withIconContainer}
      />
      <StyledMenuItemRightContent>
        {contextualTextPosition === 'right' && (
          <StyledMenuItemLabel>
            {isString(contextualText) ? (
              <StyledRightMenuItemContextualText>
                <OverflowingTextWithTooltip text={contextualText} />
              </StyledRightMenuItemContextualText>
            ) : (
              contextualText
            )}
          </StyledMenuItemLabel>
        )}

        {selected && needIconCheck && <IconCheck size={theme.icon.size.md} />}

        {hasSubMenu && (
          <IconChevronRight
            size={theme.icon.size.sm}
            color={theme.font.color.tertiary}
          />
        )}
      </StyledMenuItemRightContent>
    </StyledMenuItemSelect>
  );
};
