import { type ReactNode } from 'react';

import { type InputProps } from '@ui/primitives/input/Input/types/InputProps';

export type SearchInputProps = Omit<InputProps, 'variant'> & {
  actions?: ReactNode;
};
