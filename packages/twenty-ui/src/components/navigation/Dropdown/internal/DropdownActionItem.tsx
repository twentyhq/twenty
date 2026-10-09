import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { isBoolean } from '@sniptt/guards';
import { useId } from 'react';
import { clsx } from 'clsx';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { DropdownItemOwner } from './DropdownItemOwner';
import { DropdownItemWithActions } from './DropdownItemWithActions';
import { type DropdownActionItemProps } from '../types/DropdownActionItemProps';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownItems } from './getDropdownItems';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownItemFocus } from './useDropdownItemFocus';

export const DropdownActionItem = ({
  color,
  startIcon,
  endIcon,
  description,
  descriptionPlacement,
  shortcut,
  shortcutJoinLabel,
  hasSubmenu,
  actions,
  actionsVisibility,
  children,
  render,
  disabled = false,
  nativeButton = !isDefined(render),
  closeOnClick = true,
  onClick,
  onFocus,
  page,
  id,
  ...props
}: DropdownActionItemProps) => {
  const { type, closeTree, goToPage } = useDropdownContext();
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const itemFocus = useDropdownItemFocus({ id: itemId, disabled });

  const hasActions = isRenderableSlot(actions);
  const resolvedHasSubmenu = hasSubmenu ?? isDefined(page);

  const item = (
    <ButtonPrimitive
      {...props}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={props.role ?? (type === 'menu' ? 'menuitem' : undefined)}
      tabIndex={itemFocus.tabIndex}
      onFocus={(event) => {
        itemFocus.activate();
        onFocus?.(event);
      }}
      data-dropdown-item=""
      data-dropdown-page={page}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (isDefined(page)) {
          const content = event.currentTarget.closest<HTMLElement>(
            '[data-dropdown-content]',
          );

          if (!isDefined(content)) {
            return;
          }

          const index = getDropdownItems(content).indexOf(event.currentTarget);

          goToPage({
            id: page,
            trigger: {
              id,
              index,
              page,
              label: getDropdownItemLabel(event.currentTarget),
            },
          });
          return;
        }

        if (closeOnClick) {
          closeTree();
        }
      }}
      render={(renderProps) => {
        const nativeDisabled =
          nativeButton &&
          'disabled' in renderProps &&
          isBoolean(renderProps.disabled)
            ? renderProps.disabled
            : undefined;

        return (
          <ListItem
            {...renderProps}
            render={
              <DropdownItemOwner render={render} disabled={nativeDisabled} />
            }
            className={clsx(
              renderProps.className,
              hasActions && styles.itemWithActionsPrimary,
            )}
            disabled={disabled}
            color={color}
            startIcon={startIcon}
            endIcon={endIcon}
            actionsVisibility={actionsVisibility}
            description={description}
            descriptionPlacement={descriptionPlacement}
            shortcut={shortcut}
            shortcutJoinLabel={shortcutJoinLabel}
            hasSubmenu={!hasActions && resolvedHasSubmenu}
          >
            {children}
          </ListItem>
        );
      }}
    />
  );

  return hasActions ? (
    <DropdownItemWithActions
      actions={actions}
      actionsVisibility={actionsVisibility}
      color={color}
      disabled={disabled}
      hasSubmenu={resolvedHasSubmenu}
    >
      {item}
    </DropdownItemWithActions>
  ) : (
    item
  );
};
