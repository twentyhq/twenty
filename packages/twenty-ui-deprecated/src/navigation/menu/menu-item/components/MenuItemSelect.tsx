import { styled } from '@linaria/react';

import { isString } from '@sniptt/guards';
import {
  IconCheck,
  IconChevronRight,
  OverflowingTextWithTooltip,
  type IconComponent,
} from '@ui/display';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { useContext, type ReactNode } from 'react';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemLabel,
  StyledMenuItemRightContent,
  StyledRightMenuItemContextualText,
} from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled.div<{
  disabled?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
}>`
  --horizontal-padding: ${themeCssVariables.spacing[1]};
  --vertical-padding: ${themeCssVariables.spacing[2]};
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: row;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;
  padding: var(--vertical-padding) var(--horizontal-padding);
  position: relative;
  user-select: none;
  width: calc(100% - 2 * var(--horizontal-padding));
  transition: background 0.1s ease;
  background: ${({ disabled, focused, isKeySelected }) => {
    if (disabled === true) {
      return 'inherit';
    }
    if (focused === true || isKeySelected === true) {
      return themeCssVariables.background.transparent.light;
    }
    return '';
  }};
  &:hover {
    background: ${({ disabled }) =>
      disabled === true
        ? 'inherit'
        : themeCssVariables.background.transparent.light};
  }
  color: ${({ disabled }) =>
    disabled === true
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.secondary};
  cursor: ${({ disabled }) => (disabled === true ? 'default' : 'pointer')};
`;

type MenuItemSelectProps = {
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
  const { theme } = useContext(ThemeContext);

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
