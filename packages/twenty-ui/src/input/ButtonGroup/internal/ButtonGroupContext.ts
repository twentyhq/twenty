import { createContext } from 'react';

import { type ButtonProps } from '@ui/input/Button/types/ButtonProps';

export const ButtonGroupContext = createContext<Pick<
  ButtonProps,
  'variant' | 'color' | 'size'
> | null>(null);
