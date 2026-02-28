import { styled } from '@linaria/react';
import { type MouseEvent, useContext } from 'react';

import { type IconComponent } from '@ui/display';
import { HOVER_BACKGROUND, ThemeContext, type ThemeType } from '@ui/theme';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemLeftContent } from '../internals/components/StyledMenuItemBase';

export type MenuItemSuggestionProps = {
  LeftIcon?: IconComponent | null;
  withIconContainer?: boolean;
  text: string;
  contextualText?: string;
  contextualTextPosition?: 'left' | 'right';
  selected?: boolean;
  className?: string;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
};

const StyledSuggestionMenuItem = styled.li<{
  selected?: boolean;
  theme: ThemeType;
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
  color: ${({ theme }) => theme.font.color.secondary};

  ${HOVER_BACKGROUND};

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const MenuItemSuggestion = ({
  LeftIcon,
  withIconContainer = false,
  text,
  contextualText = undefined,
  contextualTextPosition = 'left',
  className,
  selected,
  onClick,
}: MenuItemSuggestionProps) => {
  const { theme } = useContext(ThemeContext);

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
      theme={theme}
    >
      <StyledMenuItemLeftContent theme={theme}>
        <MenuItemLeftContent
          LeftIcon={LeftIcon ?? undefined}
          text={text}
          contextualText={contextualText}
          contextualTextPosition={contextualTextPosition}
          withIconContainer={withIconContainer}
        />
      </StyledMenuItemLeftContent>
    </StyledSuggestionMenuItem>
  );
};
