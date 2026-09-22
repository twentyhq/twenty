import { type DropdownSubmenuProps } from '../types/DropdownSubmenuProps';
import { DropdownRootProvider } from './DropdownRootProvider';

export const DropdownSubmenu = ({
  kind = 'menu',
  ...props
}: DropdownSubmenuProps) => (
  <DropdownRootProvider {...props} kind={kind} isSubmenu />
);
