import { type DropdownRowRegistration } from './DropdownRowRegistration';
import { type DropdownRowRegistry } from './DropdownRowRegistry';
import { notifyDropdownRowRegistryListeners } from './notifyDropdownRowRegistryListeners';

export const registerDropdownRow = ({
  rowRegistry,
  registration,
}: {
  rowRegistry: DropdownRowRegistry;
  registration: DropdownRowRegistration;
}) => {
  rowRegistry.rows.add(registration);
  notifyDropdownRowRegistryListeners(rowRegistry);

  return () => {
    rowRegistry.rows.delete(registration);
    notifyDropdownRowRegistryListeners(rowRegistry);
  };
};
