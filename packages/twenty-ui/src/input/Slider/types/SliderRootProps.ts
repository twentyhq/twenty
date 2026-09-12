import { type Slider as SliderPrimitive } from '@base-ui/react/slider';

export type SliderRootProps<
  TValue extends number | readonly number[] = number,
> = SliderPrimitive.Root.Props<TValue> & {
  /** Color of the indicator and thumbs. */
  color?: 'accent' | 'success';
};
