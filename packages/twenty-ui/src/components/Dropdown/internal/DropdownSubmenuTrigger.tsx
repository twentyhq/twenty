import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useId } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownSubmenuTriggerProps } from '../types/DropdownSubmenuTriggerProps';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownItemFocus } from './useDropdownItemFocus';

export const DropdownSubmenuTrigger = ({
  color,
  startIcon,
  endIcon,
  description,
  descriptionPlacement,
  hotkeys,
  hasSubmenu = true,
  children,
  render,
  disabled = false,
  nativeButton = !isDefined(render),
  openOnHover = true,
  onKeyDown,
  onFocus,
  id,
  ...props
}: DropdownSubmenuTriggerProps) => {
  const { type, parentType, open, setOpen, focusOnOpenRef } =
    useDropdownContext();
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const itemFocus = useDropdownItemFocus({
    id: itemId,
    isSubmenuTrigger: true,
  });

  return (
    <PopoverPrimitive.Trigger
      {...props}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      openOnHover={openOnHover}
      role={parentType === 'menu' ? 'menuitem' : undefined}
      aria-haspopup={type === 'menu' ? 'menu' : 'dialog'}
      tabIndex={itemFocus.tabIndex}
      onFocus={(event) => {
        itemFocus.activate();
        onFocus?.(event);
      }}
      data-dropdown-item=""
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        const isRightToLeft =
          getComputedStyle(event.currentTarget).direction === 'rtl';
        const forwardKey = isRightToLeft ? 'ArrowLeft' : 'ArrowRight';

        if (event.key === forwardKey) {
          event.preventDefault();
          event.stopPropagation();
          focusOnOpenRef.current = true;
          const contentId = event.currentTarget.getAttribute('aria-controls');
          const content = isDefined(contentId)
            ? event.currentTarget.ownerDocument.getElementById(contentId)
            : null;

          if (open && isDefined(content)) {
            getDropdownFocusTarget({ content, type }).focus();
            return;
          }

          setOpen(true);
        }
      }}
      render={(renderProps) => (
        <ListItem
          {...renderProps}
          render={render ?? <button type="button" />}
          disabled={disabled}
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
