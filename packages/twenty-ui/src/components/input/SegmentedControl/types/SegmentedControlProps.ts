import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';

import { type SegmentedControlOption } from './SegmentedControlOption';
import { type SegmentedControlSize } from './SegmentedControlSize';

export type SegmentedControlProps<TValue extends string = string> = Omit<
  RadioGroupProps<TValue>,
  'aria-label' | 'aria-labelledby' | 'children' | 'role'
> & {
  itemWidth?: 'content' | 'equal';
  options: readonly SegmentedControlOption<TValue>[];
  size?: SegmentedControlSize;
} & ({ 'aria-label': string } | { 'aria-labelledby': string });
