import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useId, useRef } from 'react';
import { clsx } from 'clsx';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { DropdownItemOwner } from './DropdownItemOwner';
import { getNativeDisabled } from './getNativeDisabled';
import { DropdownItemWithActions } from './DropdownItemWithActions';
import { DropdownRowRegistrationEffect } from './DropdownRowRegistrationEffect';
import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownRow } from './useDropdownRow';

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
  id,
  ref,
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
  const row = useDropdownRow({ id: itemId, kind: 'option', disabled });
  const primaryRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(ref, primaryRef);

  const hasActions = isRenderableSlot(actions);
  const isFocused = searchTargetId === itemId;
  const resolvedIndicator =
    indicator ?? (hasSelectionState ? selectionIndicator : 'none');
  const isCheckIndicatorRenderedByRow =
    hasActions && resolvedIndicator === 'check';

  const item = (
    <ButtonPrimitive
      {...props}
      ref={mergedRef}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={isMenu ? menuOptionRole : props.role}
      aria-checked={isMenu && hasSelectionState ? selected : undefined}
      aria-pressed={
        isPressableOption && hasSelectionState ? selected : undefined
      }
      aria-current={isCurrentOption ? 'true' : undefined}
      tabIndex={row.tabIndex}
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

  return (
    <>
      {hasActions ? (
        <DropdownItemWithActions
          primaryRef={primaryRef}
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
      )}
      <DropdownRowRegistrationEffect
        elementRef={primaryRef}
        id={itemId}
        kind="option"
        disabled={disabled}
        ariaDisabled={props['aria-disabled']}
      />
    </>
  );
};
