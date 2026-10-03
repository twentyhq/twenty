import {
  AggregateOperations,
  MetadataWritability,
  ViewOpenRecordIn,
  ViewType,
} from 'twenty-shared/types';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import {
  type FlatEntityEnumPropertyRules,
  validateFlatEntityEnumProperties,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-entity-enum-properties.util';

const ENUM_PROPERTY_RULES = {
  type: { enumObject: ViewType },
  openRecordIn: { enumObject: ViewOpenRecordIn },
  kanbanAggregateOperation: {
    enumObject: AggregateOperations,
    isNullable: true,
  },
} satisfies FlatEntityEnumPropertyRules<UniversalFlatView>;

const validate = (
  flatView: Partial<Record<keyof UniversalFlatView, unknown>>,
) =>
  validateFlatEntityEnumProperties({
    flatEntity: flatView as Partial<UniversalFlatView>,
    enumPropertyRules: ENUM_PROPERTY_RULES,
    code: 'INVALID_VIEW_DATA',
  });

describe('validateFlatEntityEnumProperties', () => {
  it('should accept enum members', () => {
    expect(
      validate({
        type: ViewType.KANBAN,
        openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
        kanbanAggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual([]);
  });

  it('should skip undefined properties', () => {
    expect(validate({})).toEqual([]);
  });

  it('should accept null only for nullable properties', () => {
    expect(validate({ kanbanAggregateOperation: null })).toEqual([]);

    expect(validate({ openRecordIn: null })).toMatchObject([
      {
        code: 'INVALID_VIEW_DATA',
        message:
          'Invalid value null for openRecordIn, expected one of: SIDE_PANEL, RECORD_PAGE',
        value: null,
      },
    ]);
  });

  it.each([
    ['a typo', 'TABLEE'],
    ['a lowercase value', 'table'],
    ['a value from another enum', MetadataWritability.OPEN],
    ['a name inherited from Object.prototype', 'constructor'],
    ['a non string value', 42],
  ])('should reject %s', (_, value) => {
    expect(validate({ type: value })).toMatchObject([
      {
        code: 'INVALID_VIEW_DATA',
        message: expect.stringContaining(
          `Invalid value ${JSON.stringify(value)} for type, expected one of: TABLE,`,
        ),
        value,
      },
    ]);
  });

  it('should return one error per invalid property', () => {
    const errors = validate({
      type: 'toString',
      openRecordIn: 'side_panel',
      kanbanAggregateOperation: 'SUMM',
    });

    expect(errors.map(({ message }) => message)).toEqual([
      expect.stringContaining('Invalid value "toString" for type'),
      'Invalid value "side_panel" for openRecordIn, expected one of: SIDE_PANEL, RECORD_PAGE',
      expect.stringContaining(
        'Invalid value "SUMM" for kanbanAggregateOperation',
      ),
    ]);
  });
});
