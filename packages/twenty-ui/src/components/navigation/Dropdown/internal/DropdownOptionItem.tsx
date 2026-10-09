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
import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownItemFocus } from './useDropdownItemFocus';

export const DropdownOptionItem = ({
  selected,
  indicator,
  onSelect,
  closeOnSelect,
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
  onClick,
  onFocus,
  id,
  ...props
}: DropdownOptionItemProps) => {
  const { type, multiple, closeTree, searchTargetId } = useDropdownContext();
  const isMenu = type === 'menu';
  const hasSelectionState = isDefined(selected);
  const isPressableOption =
    !isMenu && (nativeButton || props.role === 'button');
  const isCurrentOption =
    !isMenu && !isPressableOption && hasSelectionState && selected;
  const selectableMenuOptionRole = multiple
    ? 'menuitemcheckbox'
    : 'menuitemradio';
  const menuOptionRole = hasSelectionState
    ? selectableMenuOptionRole
    : 'menuitem';
  const selectionIndicator = multiple ? 'checkbox' : 'check';
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const itemFocus = useDropdownItemFocus({ id: itemId, disabled });

  const hasActions = isRenderableSlot(actions);
  const isFocused = searchTargetId === itemId;
  const resolvedIndicator =
    indicator ?? (hasSelectionState ? selectionIndicator : 'none');
  const isCheckIndicatorRenderedByRow =
    hasActions && resolvedIndicator === 'check';

  const item = (
    <ButtonPrimitive
      {...props}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={isMenu ? menuOptionRole : props.role}
      aria-checked={isMenu && hasSelectionState ? selected : undefined}
      aria-pressed={
        isPressableOption && hasSelectionState ? selected : undefined
      }
      aria-current={isCurrentOption ? 'true' : undefined}
      tabIndex={itemFocus.tabIndex}
      onFocus={(event) => {
        itemFocus.activate();
        onFocus?.(event);
      }}
      data-dropdown-item=""
      data-dropdown-option-item=""
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        onSelect?.();

        if (closeOnSelect ?? !multiple) {
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
            selected={selected}
            focused={isFocused}
            indicator={
              isCheckIndicatorRenderedByRow ? 'none' : resolvedIndicator
            }
            color={color}
            startIcon={startIcon}
            endIcon={endIcon}
            actionsVisibility={actionsVisibility}
            description={description}
            descriptionPlacement={descriptionPlacement}
            shortcut={shortcut}
            shortcutJoinLabel={shortcutJoinLabel}
            hasSubmenu={!hasActions && hasSubmenu}
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
      selected={selected}
      focused={isFocused}
      indicator={resolvedIndicator}
      disabled={disabled}
      hasSubmenu={hasSubmenu}
    >
      {item}
    </DropdownItemWithActions>
  ) : (
    item
  );
};
