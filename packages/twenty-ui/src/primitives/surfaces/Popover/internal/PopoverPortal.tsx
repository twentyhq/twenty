import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { isUndefined } from '@sniptt/guards';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';

import { type PopoverPortalProps } from '../types/PopoverPortalProps';

export const PopoverPortal = ({ container, ...props }: PopoverPortalProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <PopoverPrimitive.Portal
      dir={direction}
      {...props}
      container={
        isUndefined(container) ? (themeContainer ?? undefined) : container
      }
    />
  );
};
