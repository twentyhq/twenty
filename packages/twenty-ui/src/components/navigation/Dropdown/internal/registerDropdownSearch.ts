import { type RefObject } from 'react';

import { type DropdownRowRegistry } from './DropdownRowRegistry';
import { notifyDropdownRowRegistryListeners } from './notifyDropdownRowRegistryListeners';

export const registerDropdownSearch = ({
  rowRegistry,
  searchRef,
}: {
  rowRegistry: DropdownRowRegistry;
  searchRef: RefObject<HTMLInputElement | null>;
}) => {
  rowRegistry.searches.add(searchRef);
  notifyDropdownRowRegistryListeners(rowRegistry);

  return () => {
    rowRegistry.searches.delete(searchRef);
    notifyDropdownRowRegistryListeners(rowRegistry);
  };
};
