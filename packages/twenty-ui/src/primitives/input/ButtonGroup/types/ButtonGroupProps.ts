import { type useRender } from '@base-ui/react/use-render';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type ButtonGroupProps = useRender.ComponentProps<'div'> &
  Pick<ButtonProps, 'variant' | 'size' | 'color'> & {
    attached?: boolean;
    framed?: boolean;
  };
