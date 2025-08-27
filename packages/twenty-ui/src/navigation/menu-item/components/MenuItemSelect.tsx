import { useTheme } from '@emotion/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { IconCheck, IconChevronRight, type IconComponent } from '@ui/display';
import { type ReactNode } from 'react';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled(StyledMenuItemBase)<{
  disabled?: boolean;
  focused?: boolean;
}>`
  ${({ disabled, focused }) => {
    if (disabled === true) {
      return css`
        background: inherit;
        &:hover {
          background: inherit;
        }

        color: var(--color-font-tertiary);

        cursor: default;
      `;
    } else if (focused === true) {
      return css`
        background: transparent;
      `;
    } else {
      return css``;
    }
  }}
`;

type MenuItemSelectProps = {
  LeftIcon?: IconComponent | null | undefined;
  selected: boolean;
  needIconCheck?: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  hasSubMenu?: boolean;
  contextualText?: ReactNode;
};

export const MenuItemSelect = ({
  LeftIcon,
  text,
  selected,
  needIconCheck = true,
  className,
  onClick,
  disabled,
  focused,
  hasSubMenu = false,
  contextualText,
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
        LeftIcon={LeftIcon}
        text={text}
        contextualText={contextualText}
      />
      {selected && needIconCheck && <IconCheck size={theme.icon.size.md} />}

      {hasSubMenu && (
        <IconChevronRight
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </StyledMenuItemSelect>
  );
};
