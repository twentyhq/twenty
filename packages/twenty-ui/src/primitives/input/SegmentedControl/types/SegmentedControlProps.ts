import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';

import { type SegmentedControlOption } from './SegmentedControlOption';

export type SegmentedControlProps<TValue extends string = string> = Omit<
  RadioGroupProps<TValue>,
  'children' | 'role'
> & {
  itemWidth?: 'content' | 'equal';
  options: readonly SegmentedControlOption<TValue>[];
};
