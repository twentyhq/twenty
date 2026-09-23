import { type DropdownSubmenuProps } from '../types/DropdownSubmenuProps';
import { DropdownRoot } from './DropdownRoot';

export const DropdownSubmenu = ({
  type = 'menu',
  ...props
}: DropdownSubmenuProps) => <DropdownRoot {...props} type={type} isSubmenu />;
