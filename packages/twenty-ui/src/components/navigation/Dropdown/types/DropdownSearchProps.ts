import { type InputProps } from '@ui/primitives/input/Input/types/InputProps';

export type DropdownSearchProps = Omit<InputProps, 'onValueChange' | 'size'> & {
  enterSelects?: 'first-match' | 'first-match-while-searching';
  onValueChange?: (value: string) => void;
};
