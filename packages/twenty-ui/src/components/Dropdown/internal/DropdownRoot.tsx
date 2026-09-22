import { type DropdownRootProps } from '../types/DropdownRootProps';
import { DropdownRootProvider } from './DropdownRootProvider';

export const DropdownRoot = (props: DropdownRootProps) => (
  <DropdownRootProvider {...props} />
);
