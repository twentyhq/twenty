import { type DropdownRowRegistry } from './DropdownRowRegistry';
import { getDropdownSearch } from './getDropdownSearch';
import { getEnabledDropdownRows } from './getEnabledDropdownRows';
import { isRovingDropdownRow } from './isRovingDropdownRow';

export const getDropdownRowCollection = (rowRegistry: DropdownRowRegistry) => {
  const search = getDropdownSearch(rowRegistry);
  const enabledRows = getEnabledDropdownRows(rowRegistry);
  const rovingRows = enabledRows.filter((row) =>
    isRovingDropdownRow({ row, search }),
  );

  return { search, enabledRows, rovingRows };
};
