import { describe, expectTypeOf, it } from 'vitest';

import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { type DropdownOptionItemState } from '../types/DropdownOptionItemState';
import { type DropdownSelectionGroupProps } from '../types/DropdownSelectionGroupProps';
import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';

describe('Dropdown selection contracts', () => {
  it('exposes mode-specific callbacks and selected render state', () => {
    type SingleProps = Extract<
      DropdownSelectionGroupProps,
      { multiple?: false }
    >;
    type MultipleProps = Extract<
      DropdownSelectionGroupProps,
      { multiple: true }
    >;
    expectTypeOf<
      Parameters<NonNullable<SingleProps['onValueChange']>>
    >().toEqualTypeOf<
      [string | null, DropdownSelectionGroupChangeEventDetails]
    >();
    expectTypeOf<
      Parameters<NonNullable<MultipleProps['onValueChange']>>
    >().toEqualTypeOf<[string[], DropdownSelectionGroupChangeEventDetails]>();
    type OptionRender = Extract<
      NonNullable<DropdownOptionItemProps['render']>,
      (...parameters: never[]) => unknown
    >;
    expectTypeOf<
      Parameters<OptionRender>[1]
    >().toEqualTypeOf<DropdownOptionItemState>();
  });

  it('requires an id only for uncontrolled groups', () => {
    expectTypeOf<{
      value: string | null;
    }>().toExtend<DropdownSelectionGroupProps>();
    expectTypeOf<{
      multiple: true;
      value: string[];
    }>().toExtend<DropdownSelectionGroupProps>();
    expectTypeOf<{
      defaultValue: string | null;
    }>().not.toExtend<DropdownSelectionGroupProps>();
    expectTypeOf<{
      id: string;
      defaultValue: string | null;
    }>().toExtend<DropdownSelectionGroupProps>();
  });
});
