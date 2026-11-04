import { useRender } from '@base-ui/react/use-render';
import { isString } from '@sniptt/guards';
import { clsx } from 'clsx';

import { IconCheck, IconChevronRight } from '@ui/icon';
import { Shortcut } from '@ui/primitives/typography/Shortcut/Shortcut';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ListItemCheckboxIndicator } from './internal/ListItemCheckboxIndicator';
import styles from './ListItem.module.scss';
import { type ListItemProps } from './types/ListItemProps';

export const ListItem = ({
  color = 'neutral',
  selected = false,
  selectionAppearance = 'default',
  active = false,
  focused = false,
  disabled = false,
  indicator = 'none',
  startIcon,
  endIcon,
  description,
  descriptionPlacement = 'inline',
  actions,
  actionsVisibility = 'hover',
  actionsPlacement = 'auto',
  shortcut,
  shortcutJoinLabel,
  hasSubmenu = false,
  className,
  children,
  render,
  ref,
  ...props
}: ListItemProps) => {
  const hasDescription = isRenderableSlot(description);
  const actionSlot = isRenderableSlot(actions) ? (
    <span className={styles.actions}>{actions}</span>
  ) : null;

  return useRender({
    render,
    ref,
    state: {
      color,
      indicator,
      selected,
      active,
      highlighted: focused,
      disabled,
    },
    props: {
      ...props,
      'data-actions-visibility': actionsVisibility,
      'data-actions-placement': actionsPlacement,
      'data-description-placement': descriptionPlacement,
      'data-selection-appearance': selectionAppearance,
      className: clsx(styles.root, className),
      children: (
        <>
          {indicator === 'checkbox' && (
            <ListItemCheckboxIndicator checked={selected} disabled={disabled} />
          )}
          {isRenderableSlot(startIcon) && (
            <span className={styles.startIcon}>{startIcon}</span>
          )}
          <span className={styles.label}>
            <span className={styles.text}>
              {isString(children) ? (
                <OverflowingTextWithTooltip text={children} />
              ) : (
                children
              )}
            </span>
            {hasDescription && descriptionPlacement !== 'end' && (
              <span
                className={clsx(
                  styles.description,
                  descriptionPlacement === 'inline' && styles.inlineDescription,
                )}
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
          {descriptionPlacement !== 'below' && actionSlot}
          {isDefined(shortcut) && (
            <Shortcut
              className={styles.hotkeys}
              shortcut={shortcut}
              sequenceJoinLabel={shortcutJoinLabel}
            />
          )}
          {isRenderableSlot(endIcon) && (
            <span className={styles.endIcon}>{endIcon}</span>
          )}
          {indicator === 'check' && selected && (
            <IconCheck className={styles.checkIndicator} aria-hidden />
          )}
          {hasSubmenu && (
            <IconChevronRight className={styles.submenuIcon} aria-hidden />
          )}
          {descriptionPlacement === 'below' && actionSlot}
        </>
      ),
    },
  });
};
