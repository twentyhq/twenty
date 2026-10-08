import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type LightButtonProps = ButtonProps & {
  emphasis?: 'standard' | 'subtle';
};
