import { type InputProps } from '@ui/primitives/input/Input/types/InputProps';

export type DropdownSearchProps = Omit<
  InputProps,
  'onValueChange' | 'size' | 'variant'
> & {
  onValueChange?: (value: string) => void;
};
