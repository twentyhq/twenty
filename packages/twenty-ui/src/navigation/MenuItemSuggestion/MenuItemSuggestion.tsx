import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { type IconComponent } from '@ui/icon';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import { StyledMenuItemLeftContent } from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MenuItemSuggestion.module.scss';

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
