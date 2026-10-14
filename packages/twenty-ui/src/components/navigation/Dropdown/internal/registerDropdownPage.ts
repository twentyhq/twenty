import { type DropdownPageRegistration } from './DropdownPageRegistration';
import { type DropdownRegistry } from './DropdownRegistry';

export const registerDropdownPage = ({
  registry,
  page,
}: {
  registry: DropdownRegistry;
  page: DropdownPageRegistration;
}) => {
  registry.pages.add(page);

  return () => {
    registry.pages.delete(page);
  };
};
