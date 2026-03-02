import { styled } from '@linaria/react';

import { isString } from '@sniptt/guards';
import {
  IconCheck,
  IconChevronRight,
  OverflowingTextWithTooltip,
  type IconComponent,
} from '@ui/display';
import { type ReactNode, useContext } from 'react';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemRightContent,
  StyledRightMenuItemContextualText,
} from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled(StyledMenuItemBase)<{
  disabled?: boolean;
  focused?: boolean;
}>`
  background: ${({ disabled, focused }) => {
    if (disabled === true) {
      return 'inherit';
    }
    if (focused === true) {
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
