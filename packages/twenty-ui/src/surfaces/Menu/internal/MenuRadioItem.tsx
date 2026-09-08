import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { isFunction } from '@sniptt/guards';

import { ListItem } from '@ui/navigation/ListItem/ListItem';

import { type MenuRadioItemProps } from '../types/MenuRadioItemProps';

export const MenuRadioItem = ({
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
}: MenuRadioItemProps) => (
  <MenuPrimitive.RadioItem
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
        indicator="check"
        selected={state.checked}
      >
        {children}
      </ListItem>
    )}
  />
);
