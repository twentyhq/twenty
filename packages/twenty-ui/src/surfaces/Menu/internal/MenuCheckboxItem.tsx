import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { isFunction } from '@sniptt/guards';

import { ListItem } from '@ui/navigation/ListItem/ListItem';

import { type MenuCheckboxItemProps } from '../types/MenuCheckboxItemProps';

export const MenuCheckboxItem = ({
  color = 'neutral',
  startIcon,
  endIcon,
  description,
  descriptionPlacement,
  hotkeys,
  disabled = false,
  children,
  render,
  ...props
}: MenuCheckboxItemProps) => (
  <MenuPrimitive.CheckboxItem
    {...props}
    disabled={disabled}
    render={(renderProps, state) => (
      <ListItem
        {...renderProps}
        render={
          isFunction(render)
            ? (listItemProps) => render(listItemProps, state)
            : render
        }
        color={color}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
        description={description}
        descriptionPlacement={descriptionPlacement}
        hotkeys={hotkeys}
        indicator="checkbox"
        selected={state.checked}
      >
        {children}
      </ListItem>
    )}
  />
);
