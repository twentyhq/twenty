import { type DropdownRootProps } from './DropdownRootProps';

export type DropdownSubmenuProps = Omit<DropdownRootProps, 'type'> &
  Partial<Pick<DropdownRootProps, 'type'>>;
