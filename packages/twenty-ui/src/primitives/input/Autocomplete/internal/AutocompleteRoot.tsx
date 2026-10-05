import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { preventDismissingClickActivation } from '@ui/utilities/internal/preventDismissingClickActivation';

import { type AutocompleteRootProps } from '../types/AutocompleteRootProps';

export const AutocompleteRoot = <TItem,>({
  onOpenChange,
  ...props
}: AutocompleteRootProps<TItem>) => (
  <AutocompletePrimitive.Root
    {...props}
    onOpenChange={(open, eventDetails) => {
      onOpenChange?.(open, eventDetails);

      if (
        open ||
        eventDetails.isCanceled ||
        eventDetails.reason !== 'outside-press'
      ) {
        return;
      }

      preventDismissingClickActivation(eventDetails.event);
    }}
  />
);
