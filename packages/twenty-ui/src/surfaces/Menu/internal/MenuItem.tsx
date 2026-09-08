import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { isFunction } from '@sniptt/guards';

import { ListItem } from '@ui/navigation/ListItem/ListItem';

import { type MenuActionItemProps } from '../types/MenuActionItemProps';

export const MenuItem = ({
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
}: MenuActionItemProps) => (
  <MenuPrimitive.Item
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
      >
        {children}
      </ListItem>
    )}
  />
);
