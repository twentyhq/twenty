import { type ComponentPropsWithRef } from 'react';

export type DropdownSearchProps = ComponentPropsWithRef<'input'> & {
  onValueChange?: (value: string) => void;
};
