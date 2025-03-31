import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck, IconChevronRight, IconComponent } from '@ui/display';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

export const StyledMenuItemSelect = styled(StyledMenuItemBase)<{
  selected: boolean;
  disabled?: boolean;
  hovered?: boolean;
}>`
  ${({ theme, selected, disabled, hovered }) => {
    if (selected) {
      return css`
        background: ${theme.background.transparent.light};
        &:hover {
          background: ${theme.background.transparent.medium};
        }
      `;
    } else if (disabled === true) {
      return css`
        background: inherit;
        &:hover {
          background: inherit;
        }

        color: ${theme.font.color.tertiary};

        cursor: default;
      `;
    } else if (hovered === true) {
      return css`
        background: ${theme.background.transparent.light};
      `;
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
  hovered?: boolean;
  hasSubMenu?: boolean;
  contextualText?: string;
};

export const MenuItemSelect = ({
  LeftIcon,
  text,
  selected,
  needIconCheck = true,
  className,
  onClick,
  disabled,
  hovered,
  hasSubMenu = false,
  contextualText,
}: MenuItemSelectProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
      disabled={disabled}
      hovered={hovered}
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
