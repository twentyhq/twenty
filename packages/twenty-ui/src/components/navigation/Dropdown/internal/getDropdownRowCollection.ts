import { type DropdownRegistry } from './DropdownRegistry';
import { getDropdownSearch } from './getDropdownSearch';
import { getEnabledDropdownRows } from './getEnabledDropdownRows';
import { isRovingDropdownRow } from './isRovingDropdownRow';

export const getDropdownRowCollection = (registry: DropdownRegistry) => {
  const search = getDropdownSearch(registry);
  const enabledRows = getEnabledDropdownRows(registry);
  const rovingRows = enabledRows.filter((row) =>
    isRovingDropdownRow({ row, search }),
  );

  return { search, enabledRows, rovingRows };
};
