import { type RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { type SegmentedControlOption } from './SegmentedControlOption';
import { type SegmentedControlSize } from './SegmentedControlSize';
import { type SegmentedControlVariant } from './SegmentedControlVariant';

export type SegmentedControlProps<TValue extends string = string> = Omit<
  RadioGroupPrimitive.Props<TValue>,
  'aria-label' | 'aria-labelledby' | 'children' | 'orientation' | 'role'
> & {
  fullWidth?: boolean;
  itemWidth?: 'content' | 'equal';
  options: readonly SegmentedControlOption<TValue>[];
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
} & ({ 'aria-label': string } | { 'aria-labelledby': string });
