import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useId } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  hotkeys,
  hasSubmenu,
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
  const itemFocus = useDropdownItemFocus({ id: itemId });

  return (
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
            content,
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
          hasSubmenu={hasSubmenu ?? isDefined(page)}
        >
          {children}
        </ListItem>
      )}
    />
  );
};
