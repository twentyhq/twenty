import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { Dropdown } from '../Dropdown';
import { getDropdownSelectionGroupState } from '../internal/getDropdownSelectionGroupState';
import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { type DropdownOptionItemState } from '../types/DropdownOptionItemState';
import { type DropdownSelectionGroupProps } from '../types/DropdownSelectionGroupProps';
import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';

describe('Dropdown selection contracts', () => {
  it('preserves controlled null and empty arrays over stored selections', () => {
    expect(
      getDropdownSelectionGroupState({
        props: { id: 'single', value: null },
        storedState: { multiple: false, value: 'removed' },
      }),
    ).toEqual({ multiple: false, value: null });
    expect(
      getDropdownSelectionGroupState({
        props: { id: 'multiple', multiple: true, value: [] },
        storedState: { multiple: true, value: ['removed'] },
      }),
    ).toEqual({ multiple: true, value: [] });
  });

  it('uses stored uncontrolled values independently of changed defaults', () => {
    expect(
      getDropdownSelectionGroupState({
        props: { id: 'single', value: undefined, defaultValue: 'new-default' },
        storedState: { multiple: false, value: 'filtered-out' },
      }),
    ).toEqual({ multiple: false, value: 'filtered-out' });
    expect(
      getDropdownSelectionGroupState({
        props: {
          id: 'multiple',
          multiple: true,
          defaultValue: ['new-default'],
        },
        storedState: { multiple: true, value: [] },
      }),
    ).toEqual({ multiple: true, value: [] });
  });

  it('initializes the appropriate empty value when selection mode changes', () => {
    expect(
      getDropdownSelectionGroupState({
        props: { id: 'selection', multiple: true },
        storedState: { multiple: false, value: 'old' },
      }),
    ).toEqual({ multiple: true, value: [] });
    expect(
      getDropdownSelectionGroupState({
        props: { id: 'selection' },
        storedState: { multiple: true, value: ['old'] },
      }),
    ).toEqual({ multiple: false, value: null });
  });

  it('renders selected picker semantics without native form inputs', () => {
    const markup = renderToStaticMarkup(
      <Dropdown.Root type="picker">
        <Dropdown.SelectionGroup
          id="choices"
          value="second"
          aria-label="Choices"
        >
          <Dropdown.OptionItem value="first">First</Dropdown.OptionItem>
          <Dropdown.OptionItem value="second">Second</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Root>,
    );

    expect(markup).toContain('role="listbox"');
    expect(markup).toContain('role="option"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).not.toContain('aria-checked');
    expect(markup).not.toContain('<input');
  });

  it('renders independent checked menu semantics', () => {
    const markup = renderToStaticMarkup(
      <Dropdown.Root type="menu">
        <Dropdown.SelectionGroup id="single" defaultValue="selected">
          <Dropdown.OptionItem value="selected">Single</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        <Dropdown.SelectionGroup id="multiple" multiple defaultValue={[]}>
          <Dropdown.OptionItem value="selected">Multiple</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Root>,
    );

    expect(markup).toContain('role="menuitemradio"');
    expect(markup).toContain('role="menuitemcheckbox"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-checked="false"');
    expect(markup).not.toContain('aria-selected');
  });

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
});
