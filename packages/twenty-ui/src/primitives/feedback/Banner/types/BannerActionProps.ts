import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type BannerActionProps = Omit<ButtonProps, 'size' | 'variant' | 'color'>;
