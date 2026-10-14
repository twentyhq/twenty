import { type DropdownRegistry } from './DropdownRegistry';
import { getDropdownRows } from './getDropdownRows';

export const getEnabledDropdownRows = (registry: DropdownRegistry) =>
  getDropdownRows(registry).filter((row) => !row.disabled);
