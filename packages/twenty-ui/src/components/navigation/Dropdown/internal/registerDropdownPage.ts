import { type DropdownPageRegistration } from './DropdownPageRegistration';
import { type DropdownRegistry } from './DropdownRegistry';
import { notifyDropdownRegistryListeners } from './notifyDropdownRegistryListeners';

export const registerDropdownPage = ({
  registry,
  page,
}: {
  registry: DropdownRegistry;
  page: DropdownPageRegistration;
}) => {
  registry.pages.add(page);
  notifyDropdownRegistryListeners(registry);

  return () => {
    registry.pages.delete(page);
    notifyDropdownRegistryListeners(registry);
  };
};
