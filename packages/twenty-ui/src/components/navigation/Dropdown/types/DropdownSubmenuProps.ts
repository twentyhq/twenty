import { type DropdownRootProps } from './DropdownRootProps';

export type DropdownSubmenuProps = Omit<
  DropdownRootProps,
  'type' | 'onEscapeKeyDown' | 'onInteractOutside'
> &
  Partial<Pick<DropdownRootProps, 'type'>>;
