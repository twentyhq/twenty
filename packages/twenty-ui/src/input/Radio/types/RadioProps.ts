import { type Radio as RadioPrimitive } from '@base-ui/react/radio';

export type RadioProps<TValue = string> = RadioPrimitive.Root.Props<TValue> & {
  size?: 'sm' | 'md';
};
