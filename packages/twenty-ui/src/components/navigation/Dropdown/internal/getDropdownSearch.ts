import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const getDropdownSearch = (rowRegistry: DropdownRowRegistry) =>
  Array.from(rowRegistry.searches)
    .map((searchRef) => searchRef.current)
    .find(
      (search): search is HTMLInputElement =>
        isDefined(search) && search.isConnected,
    ) ?? null;
