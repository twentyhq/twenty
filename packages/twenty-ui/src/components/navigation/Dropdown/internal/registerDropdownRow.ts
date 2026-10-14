import { type DropdownRowRegistration } from './DropdownRowRegistration';
import { type DropdownRegistry } from './DropdownRegistry';
import { notifyDropdownRegistryListeners } from './notifyDropdownRegistryListeners';

export const registerDropdownRow = ({
  registry,
  registration,
}: {
  registry: DropdownRegistry;
  registration: DropdownRowRegistration;
}) => {
  registry.rows.add(registration);
  notifyDropdownRegistryListeners(registry);

  return () => {
    registry.rows.delete(registration);
    notifyDropdownRegistryListeners(registry);
  };
};
