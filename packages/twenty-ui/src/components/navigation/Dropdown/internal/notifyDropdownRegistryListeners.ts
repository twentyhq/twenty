import { type DropdownRegistry } from './DropdownRegistry';

export const notifyDropdownRegistryListeners = (registry: DropdownRegistry) => {
  for (const listener of registry.listeners) {
    listener();
  }
};
