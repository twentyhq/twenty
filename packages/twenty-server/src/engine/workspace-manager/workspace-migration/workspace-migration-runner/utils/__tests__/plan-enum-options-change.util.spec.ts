import {
  getRemovedEnumOptionValues,
  planEnumOptionsChange,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/plan-enum-options-change.util';

const option = (id: string, value: string) => ({ id, value });

const FROM_OPTIONS = [option('1', 'A'), option('2', 'B'), option('3', 'C')];
const EXISTING_ENUM_VALUES = ['A', 'B', 'C'];

describe('planEnumOptionsChange', () => {
  it('needs no schema change when only labels or colors change', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: FROM_OPTIONS,
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({
      kind: 'inPlace',
      renamedValues: [],
      addedValues: [],
      removedValues: [],
    });
  });

  it('adds values before the next existing value, or at the end', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [
          option('4', 'NEW_FIRST'),
          option('1', 'A'),
          option('5', 'NEW_MIDDLE'),
          option('6', 'NEW_MIDDLE_2'),
          option('2', 'B'),
          option('3', 'C'),
          option('7', 'NEW_LAST'),
        ],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({
      kind: 'inPlace',
      renamedValues: [],
      addedValues: [
        { value: 'NEW_FIRST', beforeValue: 'A' },
        { value: 'NEW_MIDDLE', beforeValue: 'B' },
        { value: 'NEW_MIDDLE_2', beforeValue: 'B' },
        { value: 'NEW_LAST', beforeValue: undefined },
      ],
      removedValues: [],
    });
  });

  it('renames a value in place and anchors an add to its new name', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [
          option('1', 'A'),
          option('4', 'NEW'),
          option('2', 'B_RENAMED'),
          option('3', 'C'),
        ],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({
      kind: 'inPlace',
      renamedValues: [{ fromValue: 'B', toValue: 'B_RENAMED' }],
      addedValues: [{ value: 'NEW', beforeValue: 'B_RENAMED' }],
      removedValues: [],
    });
  });

  it('keeps a removed value in the type and reports it for clearing', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [option('1', 'A'), option('3', 'C')],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({
      kind: 'inPlace',
      renamedValues: [],
      addedValues: [],
      removedValues: ['B'],
    });
  });

  it('re-adds a value still in the type without adding it again', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: [option('1', 'A'), option('3', 'C')],
        toOptions: [option('1', 'A'), option('4', 'B'), option('3', 'C')],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({
      kind: 'inPlace',
      renamedValues: [],
      addedValues: [],
      removedValues: [],
    });
  });

  it('rebuilds when existing options are reordered', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [option('2', 'B'), option('1', 'A'), option('3', 'C')],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({ kind: 'rebuild' });
  });

  it('rebuilds when a re-added value would sit out of order', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: [option('1', 'A'), option('3', 'C')],
        toOptions: [option('1', 'A'), option('3', 'C'), option('4', 'B')],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({ kind: 'rebuild' });
  });

  it('rebuilds when two values swap names', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [option('1', 'B'), option('2', 'A'), option('3', 'C')],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({ kind: 'rebuild' });
  });

  it('rebuilds when a renamed value is reused by a new option', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [
          option('1', 'A_RENAMED'),
          option('4', 'A'),
          option('2', 'B'),
          option('3', 'C'),
        ],
        existingEnumValues: EXISTING_ENUM_VALUES,
      }),
    ).toEqual({ kind: 'rebuild' });
  });

  it('rebuilds when a renamed value is missing from the type', () => {
    expect(
      planEnumOptionsChange({
        fromOptions: FROM_OPTIONS,
        toOptions: [
          option('1', 'A_RENAMED'),
          option('2', 'B'),
          option('3', 'C'),
        ],
        existingEnumValues: ['B', 'C'],
      }),
    ).toEqual({ kind: 'rebuild' });
  });
});

describe('getRemovedEnumOptionValues', () => {
  it('ignores a removed option whose value a new option reuses', () => {
    expect(
      getRemovedEnumOptionValues({
        fromOptions: FROM_OPTIONS,
        toOptions: [option('1', 'A'), option('4', 'B')],
      }),
    ).toEqual(['C']);
  });
});
