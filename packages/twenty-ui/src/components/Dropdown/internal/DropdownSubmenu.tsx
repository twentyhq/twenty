import { type DropdownSubmenuProps } from '../types/DropdownSubmenuProps';
import { DropdownRootProvider } from './DropdownRootProvider';

export const DropdownSubmenu = ({
  type = 'menu',
  ...props
}: DropdownSubmenuProps) => (
  <DropdownRootProvider {...props} type={type} isSubmenu />
);
