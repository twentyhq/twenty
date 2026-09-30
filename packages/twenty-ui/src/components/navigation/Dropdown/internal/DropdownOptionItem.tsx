import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useId } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  hotkeys,
  hotkeysJoinLabel,
  hasSubmenu,
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
  const selectableMenuOptionRole = multiple
    ? 'menuitemcheckbox'
    : 'menuitemradio';
  const menuOptionRole = hasSelectionState
    ? selectableMenuOptionRole
    : 'menuitem';
  const selectionIndicator = multiple ? 'checkbox' : 'check';
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const itemFocus = useDropdownItemFocus({ id: itemId });

  return (
    <ButtonPrimitive
      {...props}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={isMenu ? menuOptionRole : undefined}
      aria-checked={isMenu && hasSelectionState ? selected : undefined}
      aria-pressed={!isMenu && hasSelectionState ? selected : undefined}
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
      render={(renderProps) => (
        <ListItem
          {...renderProps}
          render={render ?? <button type="button" />}
          disabled={disabled}
          selected={selected}
          focused={searchTargetId === itemId}
          indicator={
            indicator ?? (hasSelectionState ? selectionIndicator : 'none')
          }
          color={color}
          startIcon={startIcon}
          endIcon={endIcon}
          description={description}
          descriptionPlacement={descriptionPlacement}
          hotkeys={hotkeys}
          hotkeysJoinLabel={hotkeysJoinLabel}
          hasSubmenu={hasSubmenu}
        >
          {children}
        </ListItem>
      )}
    />
  );
};
