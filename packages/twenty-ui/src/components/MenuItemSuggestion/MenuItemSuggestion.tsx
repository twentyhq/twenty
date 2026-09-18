import { clsx } from 'clsx';
import { type MouseEvent } from 'react';
import { type MenuItemSuggestionProps } from './types/MenuItemSuggestionProps';

import { MenuItemLeftContent } from '@ui/components/MenuItem/parts/MenuItemLeftContent';
import { StyledMenuItemLeftContent } from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { handleClickableElementKeyDown } from '@ui/primitives/accessibility/utils/handleClickableElementKeyDown';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MenuItemSuggestion.module.scss';

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
    <li
      className={clsx(styles.suggestionMenuItem, className)}
      data-selected={selected || undefined}
      role={isDefined(onClick) ? 'button' : undefined}
      tabIndex={isDefined(onClick) ? 0 : undefined}
      onClick={handleMenuItemClick}
      onKeyDown={handleClickableElementKeyDown}
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
    </li>
  );
};
