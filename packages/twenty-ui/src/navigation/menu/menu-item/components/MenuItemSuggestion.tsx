import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';

import { type IconComponent } from '@ui/display';
import { themeCssVariables } from '@ui/theme';
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
}>`
  --horizontal-padding: ${themeCssVariables.spacing[1]};
  --vertical-padding: ${themeCssVariables.spacing[2]};

  align-items: center;

  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: ${themeCssVariables.font.size.sm};

  gap: ${themeCssVariables.spacing[2]};

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  background: ${({ selected }) =>
    selected ? themeCssVariables.background.transparent.medium : ''};
  color: ${themeCssVariables.font.color.secondary};

  transition: background 0.1s ease;
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

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
