import { type RefObject } from 'react';

import { type DropdownRegistry } from './DropdownRegistry';
import { notifyDropdownRegistryListeners } from './notifyDropdownRegistryListeners';

export const registerDropdownSearch = ({
  registry,
  searchRef,
}: {
  registry: DropdownRegistry;
  searchRef: RefObject<HTMLInputElement | null>;
}) => {
  registry.searches.add(searchRef);
  notifyDropdownRegistryListeners(registry);

  return () => {
    registry.searches.delete(searchRef);
    notifyDropdownRegistryListeners(registry);
  };
};
