import { describe, expect, it } from 'vitest';

import { getDropdownSelectionGroupState } from '../getDropdownSelectionGroupState';

describe('getDropdownSelectionGroupState', () => {
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
});
