import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';

import { type SegmentedControlOption } from './SegmentedControlOption';
import { type SegmentedControlSize } from './SegmentedControlSize';
import { type SegmentedControlVariant } from './SegmentedControlVariant';

export type SegmentedControlProps<TValue extends string = string> = Omit<
  RadioGroupProps<TValue>,
  'aria-label' | 'aria-labelledby' | 'children' | 'orientation' | 'role'
> & {
  fullWidth?: boolean;
  itemWidth?: 'content' | 'equal';
  options: readonly SegmentedControlOption<TValue>[];
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
} & ({ 'aria-label': string } | { 'aria-labelledby': string });
