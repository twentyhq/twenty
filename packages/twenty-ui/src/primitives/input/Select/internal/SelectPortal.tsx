import { Select as SelectPrimitive } from '@base-ui/react/select';
import { isUndefined } from '@sniptt/guards';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';

import { type SelectPortalProps } from '../types/SelectPortalProps';

export const SelectPortal = ({ container, ...props }: SelectPortalProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <SelectPrimitive.Portal
      dir={direction}
      {...props}
      container={
        isUndefined(container) ? (themeContainer ?? undefined) : container
      }
    />
  );
};
