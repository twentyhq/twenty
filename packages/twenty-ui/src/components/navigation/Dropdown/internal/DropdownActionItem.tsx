import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useContext, useId, useRef } from 'react';
import { clsx } from 'clsx';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { DropdownBackContext } from './DropdownBackContext';
import { DropdownItemOwner } from './DropdownItemOwner';
import { getNativeDisabled } from './getNativeDisabled';
import { DropdownItemWithActions } from './DropdownItemWithActions';
import { DropdownRowRegistrationEffect } from './DropdownRowRegistrationEffect';
import { type DropdownActionItemProps } from '../types/DropdownActionItemProps';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getEnabledDropdownRows } from './getEnabledDropdownRows';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownRow } from './useDropdownRow';

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
  page,
  id,
  ref,
  ...props
}: DropdownActionItemProps) => {
  const { type, closeTree, goToPage } = useDropdownContext();
  const isBack = useContext(DropdownBackContext);
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const kind = isBack ? 'back' : 'action';
  const row = useDropdownRow({ id: itemId, kind, disabled });
  const primaryRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(ref, primaryRef);

  const hasActions = isRenderableSlot(actions);
  const resolvedHasSubmenu = hasSubmenu ?? isDefined(page);

  const item = (
    <ButtonPrimitive
      {...props}
      ref={mergedRef}
      id={itemId}
      disabled={disabled}
      nativeButton={nativeButton}
      role={props.role ?? (type === 'menu' ? 'menuitem' : undefined)}
      tabIndex={row.tabIndex}
      data-dropdown-item=""
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (isDefined(page)) {
          if (!isDefined(row.rowRegistry)) {
            return;
          }

          const { currentTarget } = event;
          const index = getEnabledDropdownRows(row.rowRegistry).findIndex(
            (enabledRow) => enabledRow.element === currentTarget,
          );

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

  return (
    <>
      {hasActions ? (
        <DropdownItemWithActions
          primaryRef={primaryRef}
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
      )}
      <DropdownRowRegistrationEffect
        elementRef={primaryRef}
        id={itemId}
        kind={kind}
        disabled={disabled}
        ariaDisabled={props['aria-disabled']}
        page={page}
      />
    </>
  );
};
