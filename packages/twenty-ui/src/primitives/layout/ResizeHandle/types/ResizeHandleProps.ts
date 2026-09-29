import { type useRender } from '@base-ui/react/use-render';

export type ResizeHandleProps = useRender.ComponentProps<'div'> & {
  axis?: 'x' | 'y';
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};
