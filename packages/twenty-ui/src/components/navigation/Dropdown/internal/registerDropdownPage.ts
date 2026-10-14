import { type DropdownPageRegistration } from './DropdownPageRegistration';
import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const registerDropdownPage = ({
  rowRegistry,
  page,
}: {
  rowRegistry: DropdownRowRegistry;
  page: DropdownPageRegistration;
}) => {
  rowRegistry.pages.add(page);

  return () => {
    rowRegistry.pages.delete(page);
  };
};
