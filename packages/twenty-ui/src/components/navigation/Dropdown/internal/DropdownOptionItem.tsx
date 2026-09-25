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
  const { type, multiple, closeTree } = useDropdownContext();
  const isMenu = type === 'menu';
  const menuOptionRole = multiple ? 'menuitemcheckbox' : 'menuitemradio';
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
      aria-checked={isMenu ? selected : undefined}
      aria-pressed={isMenu ? undefined : selected}
      tabIndex={itemFocus.tabIndex}
      onFocus={(event) => {
        itemFocus.activate();
        onFocus?.(event);
      }}
      data-dropdown-item=""
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
          indicator={indicator ?? (multiple ? 'checkbox' : 'check')}
          color={color}
          startIcon={startIcon}
          endIcon={endIcon}
          description={description}
          descriptionPlacement={descriptionPlacement}
          hotkeys={hotkeys}
          hasSubmenu={hasSubmenu}
        >
          {children}
        </ListItem>
      )}
    />
  );
};
