import { type DropdownRegistry } from './DropdownRegistry';

export type DropdownRowScope = {
  registry: DropdownRegistry;
  rowIds?: string[];
  tabStopRowId?: string;
};
