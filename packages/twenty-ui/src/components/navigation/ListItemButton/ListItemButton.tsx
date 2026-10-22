import { Button as ButtonPrimitive } from '@base-ui/react/button';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';

import { type ListItemButtonProps } from './types/ListItemButtonProps';

export const ListItemButton = ({
  color,
  selected,
  selectionAppearance,
  active,
  focused,
  indicator,
  startIcon,
  endIcon,
  description,
  descriptionPlacement,
  shortcut,
  shortcutJoinLabel,
  hasSubmenu,
  disabled = false,
  type = 'button',
  children,
  ...buttonProps
}: ListItemButtonProps) => (
  <ListItem
    color={color}
    selected={selected}
    selectionAppearance={selectionAppearance}
    active={active}
    focused={focused}
    indicator={indicator}
    startIcon={startIcon}
    endIcon={endIcon}
    description={description}
    descriptionPlacement={descriptionPlacement}
    shortcut={shortcut}
    shortcutJoinLabel={shortcutJoinLabel}
    hasSubmenu={hasSubmenu}
    disabled={disabled}
    render={
      <ButtonPrimitive
        {...buttonProps}
        nativeButton
        type={type}
        disabled={disabled}
      />
    }
  >
    {children}
  </ListItem>
);
