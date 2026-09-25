import { type InputProps } from '@ui/primitives/input/Input/types/InputProps';

export type DropdownSearchProps = Omit<InputProps, 'onValueChange' | 'size'> & {
  onValueChange?: (value: string) => void;
};
