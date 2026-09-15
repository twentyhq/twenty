import { type Radio as RadioPrimitive } from '@base-ui/react/radio';

export type RadioProps<TValue = string> = RadioPrimitive.Root.Props<TValue> & {
  /** Visual size of the radio. */
  size?: 'sm' | 'md';
};
