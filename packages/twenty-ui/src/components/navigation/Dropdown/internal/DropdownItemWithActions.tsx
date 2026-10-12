import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import { IconCheck, IconChevronRight } from '@ui/icon';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';
import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

import styles from '../Dropdown.module.scss';

const DROPDOWN_ITEM_SELECTOR = '[data-dropdown-item]';

type DropdownItemWithActionsProps = Pick<
  ListItemProps,
  | 'actions'
  | 'actionsVisibility'
  | 'color'
  | 'selected'
  | 'focused'
  | 'indicator'
  | 'disabled'
  | 'hasSubmenu'
> & {
  children: ReactNode;
};

export const DropdownItemWithActions = ({
  actions,
  actionsVisibility = 'hover',
  color = 'neutral',
  selected = false,
  focused = false,
  indicator = 'none',
  disabled = false,
  hasSubmenu = false,
  children,
}: DropdownItemWithActionsProps) => (
  <div
    className={clsx(listItemStyles.root, styles.itemWithActions)}
    role="none"
    data-actions-visibility={actionsVisibility}
    data-color={color}
    data-selected={selected ? '' : undefined}
    data-highlighted={focused ? '' : undefined}
    data-indicator={indicator}
    data-disabled={disabled ? '' : undefined}
    onClick={(event) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      event.currentTarget
        .querySelector<HTMLElement>(DROPDOWN_ITEM_SELECTOR)
        ?.click();
    }}
  >
    {children}
    <span className={clsx(listItemStyles.actions, styles.itemActions)}>
      {actions}
    </span>
    {indicator === 'check' && selected && (
      <IconCheck
        className={clsx(listItemStyles.checkIndicator, styles.itemDecoration)}
        aria-hidden
      />
    )}
    {hasSubmenu && (
      <IconChevronRight
        className={clsx(listItemStyles.submenuIcon, styles.itemDecoration)}
        aria-hidden
      />
    )}
  </div>
);
