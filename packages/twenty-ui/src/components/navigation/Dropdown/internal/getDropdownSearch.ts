import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRegistry } from './DropdownRegistry';

export const getDropdownSearch = (registry: DropdownRegistry) =>
  Array.from(registry.searches)
    .map((searchRef) => searchRef.current)
    .find(
      (search): search is HTMLInputElement =>
        isDefined(search) && search.isConnected,
    ) ?? null;
