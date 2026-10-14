import { type DropdownRowRegistry } from './DropdownRowRegistry';

export type DropdownRowScope = {
  rowRegistry: DropdownRowRegistry;
  rowIds?: string[];
  tabStopRowId?: string;
};
