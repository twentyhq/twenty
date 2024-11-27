import styled from '@emotion/styled';
import { MouseEvent } from 'react';

import { IconComponent } from '@ui/display';
import { HOVER_BACKGROUND } from '@ui/theme';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemLeftContent } from '../internals/components/StyledMenuItemBase';

export type MenuItemSuggestionProps = {
  LeftIcon?: IconComponent | null;
  text: string;
  selected?: boolean;
  className?: string;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
};

const StyledSuggestionMenuItem = styled.li<{
  selected?: boolean;
}>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  background: ${({ selected, theme }) =>
    selected ? theme.background.transparent.medium : ''};

  ${HOVER_BACKGROUND};

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const MenuItemSuggestion = ({
  LeftIcon,
  text,
  className,
  selected,
  onClick,
}: MenuItemSuggestionProps) => {
  const handleMenuItemClick = (event: MouseEvent<HTMLLIElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledSuggestionMenuItem
      onClick={handleMenuItemClick}
      className={className}
      selected={selected}
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon ?? undefined} text={text} />
      </StyledMenuItemLeftContent>
    </StyledSuggestionMenuItem>
  );
};
