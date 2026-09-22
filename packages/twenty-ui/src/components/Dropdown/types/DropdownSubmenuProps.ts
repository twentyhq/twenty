import { type DropdownRootProps } from './DropdownRootProps';

export type DropdownSubmenuProps = Omit<DropdownRootProps, 'kind'> &
  Partial<Pick<DropdownRootProps, 'kind'>>;
