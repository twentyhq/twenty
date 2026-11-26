import { type ComponentPropsWithRef } from 'react';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type ReactionButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-pressed'
  | 'children'
  | 'color'
  | 'type'
> &
  Pick<ButtonProps, 'loading'> & {
    emoji: string;
    count: number | string;
    pressed: boolean;
    onPressedChange: (pressed: boolean) => void;
  } & (
    | { 'aria-label': string; 'aria-labelledby'?: string }
    | { 'aria-label'?: string; 'aria-labelledby': string }
  );
