import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useContext, useId } from 'react';
import { clsx } from 'clsx';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { DropdownOptionItemOwner } from './DropdownOptionItemOwner';
import { DropdownSelectionContext } from './DropdownSelectionContext';
import { createDropdownSelectionEventDetails } from './createDropdownSelectionEventDetails';
import { getDropdownOptionItemRole } from './getDropdownOptionItemRole';
import { isDropdownOptionItemSelected } from './isDropdownOptionItemSelected';
import { dropdownItemActivation } from './dropdownItemActivation';
import { getNativeDisabled } from './getNativeDisabled';
import { DropdownItemWithActions } from './DropdownItemWithActions';
import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { getDropdownItemExplicitId } from './getDropdownItemExplicitId';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownItemFocus } from './useDropdownItemFocus';

export const DropdownOptionItem = ({
  value,
  selected: standaloneSelected,
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
  ...props
}: DropdownOptionItemProps) => {
  const {
    type,
    multiple: standaloneMultiple,
    closeTree,
    searchTargetId,
  } = useDropdownContext();
  const selection = useContext(DropdownSelectionContext);
  const hasSelectionOwner = isDefined(selection) && isDefined(value);
  const multiple = hasSelectionOwner ? selection.multiple : standaloneMultiple;
  const selected = isDropdownOptionItemSelected({
    selection,
    value,
    standaloneSelected,
  });
  const isMenu = type === 'menu';
  const isPickerOption = type === 'picker' && hasSelectionOwner;
  const hasSelectionState = isDefined(selected);
  const isPressableOption =
    !isMenu && !isPickerOption && (nativeButton || props.role === 'button');
  const isCurrentOption =
    !isMenu &&
    !isPickerOption &&
    !isPressableOption &&
    hasSelectionState &&
    selected;
  const role = getDropdownOptionItemRole({
    type,
    hasSelectionState,
    hasSelectionOwner,
    multiple,
    role: props.role,
  });
  const selectionIndicator = multiple ? 'checkbox' : 'check';
  const generatedId = useId();
  const itemId = getDropdownItemExplicitId({ id, render }) ?? generatedId;
  const itemFocus = useDropdownItemFocus({ id: itemId, disabled });

  const hasActions = isRenderableSlot(actions);
  const isFocused = searchTargetId === itemId;
  const resolvedIndicator =
    indicator ?? (hasSelectionState ? selectionIndicator : 'none');
  const isCheckIndicatorRenderedByRow =
    hasActions && resolvedIndicator === 'check';

  const item = (
    <ButtonPrimitive
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={role}
      aria-checked={isMenu && hasSelectionState ? selected : undefined}
      aria-selected={isPickerOption ? selected : undefined}
      aria-pressed={
        isPressableOption && hasSelectionState ? selected : undefined
      }
      aria-current={isCurrentOption ? 'true' : undefined}
      tabIndex={itemFocus.tabIndex}
      data-dropdown-item=""
      data-dropdown-option-item=""
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        const eventDetails = createDropdownSelectionEventDetails({
          event: dropdownItemActivation.getEvent({
            item: event.currentTarget,
            event: event.nativeEvent,
          }),
          trigger: event.currentTarget,
        });

        onSelect?.(eventDetails);

        if (eventDetails.isCanceled || event.defaultPrevented) {
          return;
        }

        if (hasSelectionOwner) {
          selection.select({ value, eventDetails });
        }

        if (eventDetails.isCanceled || event.defaultPrevented) {
          return;
        }

        if (
          closeOnSelect ??
          (hasSelectionOwner ? selection.closeOnSelect : !multiple)
        ) {
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
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...renderProps}
            render={
              <DropdownOptionItemOwner
                render={render}
                disabled={nativeDisabled}
                state={{ selected: selected ?? false, multiple, disabled }}
              />
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
