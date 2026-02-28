import { styled } from '@linaria/react';

import { isString } from '@sniptt/guards';
import {
  IconCheck,
  IconChevronRight,
  OverflowingTextWithTooltip,
  type IconComponent,
} from '@ui/display';
import { forwardRef, type ReactNode, useContext } from 'react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  type MenuItemBaseProps,
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemRightContent,
  StyledRightMenuItemContextualText,
} from '../internals/components/StyledMenuItemBase';

const RawStyledMenuItemSelect = styled(StyledMenuItemBase)<{
  disabled?: boolean;
  focused?: boolean;
  theme: ThemeType;
}>`
  ${({ theme, disabled, focused }) => {
    if (disabled === true) {
      return `
        background: inherit;
        &:hover {
          background: inherit;
        }

        color: ${theme.font.color.tertiary};

        cursor: default;
      `;
    } else if (focused === true) {
      return `
        background: ${theme.background.transparent.light};
      `;
    }

    return '';
  }}
`;

export const StyledMenuItemSelect = forwardRef<
  HTMLDivElement,
  MenuItemBaseProps & {
    focused?: boolean;
  } & React.ComponentPropsWithoutRef<'div'>
>(({ theme: propTheme, ...rest }, ref) => {
  const { theme: contextTheme } = useContext(ThemeContext);
  return (
    <RawStyledMenuItemSelect
      {...rest}
      theme={propTheme ?? contextTheme}
      ref={ref as any}
    />
  );
});
StyledMenuItemSelect.displayName = 'StyledMenuItemSelect';

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
      theme={theme}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon}
        text={text}
        contextualText={
          contextualTextPosition === 'left' ? contextualText : null
        }
        withIconContainer={withIconContainer}
      />
      <StyledMenuItemRightContent theme={theme}>
        {contextualTextPosition === 'right' && (
          <StyledMenuItemLabel theme={theme}>
            {isString(contextualText) ? (
              <StyledRightMenuItemContextualText theme={theme}>
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
