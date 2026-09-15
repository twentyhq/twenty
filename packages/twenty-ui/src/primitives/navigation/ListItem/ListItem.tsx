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
  hasSubmenu = false,
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
      event.preventDefault();
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
            <div className={styles.startIcon}>{startIcon}</div>
          )}
          <div className={styles.label}>
            <div className={styles.text}>{children}</div>
            {hasDescription && descriptionPlacement === 'inline' && (
              <div
                className={clsx(styles.description, styles.inlineDescription)}
              >
                {description}
              </div>
            )}
          </div>
          {hasDescription && descriptionPlacement === 'end' && (
            <div className={clsx(styles.description, styles.endDescription)}>
              {description}
            </div>
          )}
          {isRenderableSlot(actions) && (
            <div className={styles.actions}>{actions}</div>
          )}
          {isNonEmptyArray(hotkeys) && (
            <div className={styles.hotkeys}>
              <MenuItemHotKeys hotKeys={hotkeys} />
            </div>
          )}
          {isRenderableSlot(endIcon) && (
            <div className={styles.endIcon}>{endIcon}</div>
          )}
          {indicator === 'check' && selected && (
            <IconCheck className={styles.checkIndicator} aria-hidden />
          )}
          {hasSubmenu && (
            <IconChevronRight className={styles.submenuIcon} aria-hidden />
          )}
        </>
      ),
    },
  });
};
