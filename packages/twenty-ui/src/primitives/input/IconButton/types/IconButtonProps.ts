import { type ReactNode } from 'react';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type IconButtonProps = Omit<
  ButtonProps,
  | 'children'
  | 'startIcon'
  | 'endIcon'
  | 'hotkeys'
  | 'fullWidth'
  | 'soon'
  | 'soonLabel'
> & {
  children: ReactNode;
  'aria-label': string;
};
