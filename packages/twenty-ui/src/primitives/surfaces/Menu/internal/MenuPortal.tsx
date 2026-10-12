import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { isUndefined } from '@sniptt/guards';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';

import { type MenuPortalProps } from '../types/MenuPortalProps';

export const MenuPortal = ({ container, ...props }: MenuPortalProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <MenuPrimitive.Portal
      dir={direction}
      {...props}
      container={
        isUndefined(container) ? (themeContainer ?? undefined) : container
      }
    />
  );
};
