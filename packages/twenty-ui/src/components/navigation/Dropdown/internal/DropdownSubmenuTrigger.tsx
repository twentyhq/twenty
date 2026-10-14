import { useDirection } from '@base-ui/react/direction-provider';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useId } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownSubmenuTriggerProps } from '../types/DropdownSubmenuTriggerProps';
import { DropdownItemOwner } from './DropdownItemOwner';
import { getNativeDisabled } from './getNativeDisabled';
import { DropdownRowRegistrationEffect } from './DropdownRowRegistrationEffect';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownRow } from './useDropdownRow';
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
  id,
  ref,
  ...props
}: DropdownSubmenuTriggerProps) => {
  const direction = useDirection();
  const {
    type,
    rootType,
    parentType,
    open,
    pageId,
    rowRegistry,
    contentRef,
    submenuTriggerRef,
    setOpen,
    setFocusOnOpen,
    registerTrigger,
  } = useDropdownContext();
  const triggerType = open ? type : rootType;
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const row = useDropdownRow({
    id: itemId,
    kind: 'submenu-trigger',
    disabled,
  });
  const registerTriggerElement =
    useRegisterDropdownLabelElement(registerTrigger);
  const mergedRef = useMergedRefs(
    ref,
    registerTriggerElement,
    submenuTriggerRef,
  );

  return (
    <>
      <Popover.Trigger
        {...props}
        ref={mergedRef}
        id={itemId}
        disabled={disabled}
        nativeButton={nativeButton}
        openOnHover={openOnHover}
        role={parentType === 'menu' ? 'menuitem' : undefined}
        aria-haspopup={triggerType === 'menu' ? 'menu' : 'dialog'}
        tabIndex={row.tabIndex}
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
            const submenuContent = contentRef.current;

            if (open && isDefined(submenuContent)) {
              getDropdownFocusTarget({
                content: submenuContent,
                rowRegistry,
                pageId,
                type,
              }).focus();
              return;
            }

            setOpen(true);
          }
        }}
        render={(renderProps) => {
          const nativeDisabled = getNativeDisabled({
            nativeButton,
            renderProps,
          });

          return (
            <ListItem
              {...renderProps}
              render={
                <DropdownItemOwner render={render} disabled={nativeDisabled} />
              }
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
          );
        }}
      />
      <DropdownRowRegistrationEffect
        elementRef={submenuTriggerRef}
        id={itemId}
        kind="submenu-trigger"
        disabled={disabled}
        ariaDisabled={props['aria-disabled']}
      />
    </>
  );
};
