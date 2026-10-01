import { useDirection } from '@base-ui/react/direction-provider';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useId } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownSubmenuTriggerProps } from '../types/DropdownSubmenuTriggerProps';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownItemFocus } from './useDropdownItemFocus';
import { useRegisterDropdownLabelElement } from './useRegisterDropdownLabelElement';

export const DropdownSubmenuTrigger = ({
  color,
  startIcon,
  endIcon,
  description,
  descriptionPlacement,
  shortcut,
  shortcutJoinLabel,
  hasSubmenu = true,
  children,
  render,
  disabled = false,
  nativeButton = !isDefined(render),
  openOnHover = true,
  onKeyDown,
  onFocus,
  id,
  ref,
  ...props
}: DropdownSubmenuTriggerProps) => {
  const direction = useDirection();
  const { type, parentType, open, setOpen, setFocusOnOpen, registerTrigger } =
    useDropdownContext();
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const itemFocus = useDropdownItemFocus({
    id: itemId,
    isSubmenuTrigger: true,
  });
  const registerTriggerElement =
    useRegisterDropdownLabelElement(registerTrigger);
  const mergedRef = useMergedRefs(ref, registerTriggerElement);

  return (
    <Popover.Trigger
      {...props}
      ref={mergedRef}
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

        const isRightToLeft = direction === 'rtl';
        const forwardKey = isRightToLeft ? 'ArrowLeft' : 'ArrowRight';

        if (event.key === forwardKey) {
          event.preventDefault();
          event.stopPropagation();
          setFocusOnOpen(true);
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
          shortcut={shortcut}
          shortcutJoinLabel={shortcutJoinLabel}
          hasSubmenu={hasSubmenu}
        >
          {children}
        </ListItem>
      )}
    />
  );
};
