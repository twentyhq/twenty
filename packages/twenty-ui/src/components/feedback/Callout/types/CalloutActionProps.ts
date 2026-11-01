import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type CalloutActionProps = Omit<ButtonProps, 'size' | 'variant'>;
