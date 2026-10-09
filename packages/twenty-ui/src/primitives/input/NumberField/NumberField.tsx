import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';

import { NumberFieldDecrement } from './internal/NumberFieldDecrement';
import { NumberFieldGroup } from './internal/NumberFieldGroup';
import { NumberFieldIncrement } from './internal/NumberFieldIncrement';
import { NumberFieldInput } from './internal/NumberFieldInput';

export const NumberField = {
  Root: NumberFieldPrimitive.Root,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  Increment: NumberFieldIncrement,
  Decrement: NumberFieldDecrement,
  ScrubArea: NumberFieldPrimitive.ScrubArea,
  ScrubAreaCursor: NumberFieldPrimitive.ScrubAreaCursor,
};
