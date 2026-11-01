import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { isUndefined } from '@sniptt/guards';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';

import { type AutocompletePortalProps } from '../types/AutocompletePortalProps';

export const AutocompletePortal = ({
  container,
  ...props
}: AutocompletePortalProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <AutocompletePrimitive.Portal
      dir={direction}
      {...props}
      container={
        isUndefined(container) ? (themeContainer ?? undefined) : container
      }
    />
  );
};
