import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyArray } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { IconCheck, IconChevronRight } from '@ui/icon';
import { MenuItemHotKeys } from '@ui/navigation/MenuItemHotKeys/MenuItemHotKeys';

import { isRenderableSlot } from './internal/isRenderableSlot';
import { ListItemCheckboxIndicator } from './internal/ListItemCheckboxIndicator';
import styles from './ListItem.module.scss';
import { type ListItemProps } from './types/ListItemProps';

export const ListItem = ({
  color = 'neutral',
  selected = false,
  focused = false,
  disabled = false,
  indicator = 'none',
  startIcon,
  endIcon,
  description,
  descriptionPlacement = 'inline',
  actions,
  hotkeys,
  submenu = false,
  className,
  children,
  render,
  ref,
  onClick,
  ...props
}: ListItemProps) => {
  const hasDescription = isRenderableSlot(description);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    onClick?.(event);
  };

  return useRender({
    render,
    ref,
    state: { color, indicator, selected, highlighted: focused, disabled },
    props: {
      ...props,
      className: clsx(styles.root, className),
      'aria-disabled': disabled || undefined,
      onClick: handleClick,
      children: (
        <>
          {indicator === 'checkbox' && (
            <ListItemCheckboxIndicator checked={selected} disabled={disabled} />
          )}
          {isRenderableSlot(startIcon) && (
            <span className={styles.startIcon}>{startIcon}</span>
          )}
          <span className={styles.label}>
            <span className={styles.text}>{children}</span>
            {hasDescription && descriptionPlacement === 'inline' && (
              <span
                className={clsx(styles.description, styles.inlineDescription)}
              >
                {description}
              </span>
            )}
          </span>
          {hasDescription && descriptionPlacement === 'end' && (
            <span className={clsx(styles.description, styles.endDescription)}>
              {description}
            </span>
          )}
          {isRenderableSlot(actions) && (
            <span className={styles.actions}>{actions}</span>
          )}
          {isNonEmptyArray(hotkeys) && (
            <span className={styles.hotkeys}>
              <MenuItemHotKeys hotKeys={hotkeys} />
            </span>
          )}
          {isRenderableSlot(endIcon) && (
            <span className={styles.endIcon}>{endIcon}</span>
          )}
          {indicator === 'check' && selected && (
            <IconCheck className={styles.checkIndicator} aria-hidden />
          )}
          {submenu && (
            <IconChevronRight className={styles.submenuIcon} aria-hidden />
          )}
        </>
      ),
    },
  });
};
