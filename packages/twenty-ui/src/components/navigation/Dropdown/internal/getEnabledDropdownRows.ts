import { type DropdownRowRegistry } from './DropdownRowRegistry';
import { getDropdownRows } from './getDropdownRows';

export const getEnabledDropdownRows = (rowRegistry: DropdownRowRegistry) =>
  getDropdownRows(rowRegistry).filter((row) => !row.disabled);
