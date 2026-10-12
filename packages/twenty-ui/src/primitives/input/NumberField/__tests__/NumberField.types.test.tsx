import { type NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { expectTypeOf, it } from 'vitest';

import { NumberField } from '../NumberField';
import { type NumberFieldDecrementProps } from '../types/NumberFieldDecrementProps';
import { type NumberFieldDecrementState } from '../types/NumberFieldDecrementState';
import { type NumberFieldGroupProps } from '../types/NumberFieldGroupProps';
import { type NumberFieldGroupState } from '../types/NumberFieldGroupState';
import { type NumberFieldIncrementProps } from '../types/NumberFieldIncrementProps';
import { type NumberFieldIncrementState } from '../types/NumberFieldIncrementState';
import { type NumberFieldInputProps } from '../types/NumberFieldInputProps';
import { type NumberFieldInputState } from '../types/NumberFieldInputState';
import { type NumberFieldRootChangeEventDetails } from '../types/NumberFieldRootChangeEventDetails';
import { type NumberFieldRootCommitEventDetails } from '../types/NumberFieldRootCommitEventDetails';
import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';
import { type NumberFieldRootState } from '../types/NumberFieldRootState';
import { type NumberFieldScrubAreaCursorProps } from '../types/NumberFieldScrubAreaCursorProps';
import { type NumberFieldScrubAreaCursorState } from '../types/NumberFieldScrubAreaCursorState';
import { type NumberFieldScrubAreaProps } from '../types/NumberFieldScrubAreaProps';
import { type NumberFieldScrubAreaState } from '../types/NumberFieldScrubAreaState';

it('retains all upstream part props and states', () => {
  expectTypeOf<NumberFieldRootProps>().toEqualTypeOf<NumberFieldPrimitive.Root.Props>();
  expectTypeOf<NumberFieldRootState>().toEqualTypeOf<NumberFieldPrimitive.Root.State>();
  expectTypeOf<NumberFieldGroupProps>().toEqualTypeOf<NumberFieldPrimitive.Group.Props>();
  expectTypeOf<NumberFieldGroupState>().toEqualTypeOf<NumberFieldPrimitive.Group.State>();
  expectTypeOf<NumberFieldInputProps>().toEqualTypeOf<NumberFieldPrimitive.Input.Props>();
  expectTypeOf<NumberFieldInputState>().toEqualTypeOf<NumberFieldPrimitive.Input.State>();
  expectTypeOf<NumberFieldIncrementProps>().toEqualTypeOf<NumberFieldPrimitive.Increment.Props>();
  expectTypeOf<NumberFieldIncrementState>().toEqualTypeOf<NumberFieldPrimitive.Increment.State>();
  expectTypeOf<NumberFieldDecrementProps>().toEqualTypeOf<NumberFieldPrimitive.Decrement.Props>();
  expectTypeOf<NumberFieldDecrementState>().toEqualTypeOf<NumberFieldPrimitive.Decrement.State>();
  expectTypeOf<NumberFieldScrubAreaProps>().toEqualTypeOf<NumberFieldPrimitive.ScrubArea.Props>();
  expectTypeOf<NumberFieldScrubAreaState>().toEqualTypeOf<NumberFieldPrimitive.ScrubArea.State>();
  expectTypeOf<NumberFieldScrubAreaCursorProps>().toEqualTypeOf<NumberFieldPrimitive.ScrubAreaCursor.Props>();
  expectTypeOf<NumberFieldScrubAreaCursorState>().toEqualTypeOf<NumberFieldPrimitive.ScrubAreaCursor.State>();
});

it('infers nullable values and distinct change and commit event details', () => {
  <NumberField.Root
    value={null}
    step="any"
    onValueChange={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<number | null>();
      expectTypeOf(details).toEqualTypeOf<NumberFieldRootChangeEventDetails>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<NumberFieldPrimitive.Root.ChangeEventDetails>();
      details.cancel();
    }}
    onValueCommitted={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<number | null>();
      expectTypeOf(details).toEqualTypeOf<NumberFieldRootCommitEventDetails>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<NumberFieldPrimitive.Root.CommitEventDetails>();
    }}
  />;
});
