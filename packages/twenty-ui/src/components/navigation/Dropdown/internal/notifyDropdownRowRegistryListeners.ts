import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const notifyDropdownRowRegistryListeners = (
  rowRegistry: DropdownRowRegistry,
) => {
  for (const listener of rowRegistry.listeners) {
    listener();
  }
};
