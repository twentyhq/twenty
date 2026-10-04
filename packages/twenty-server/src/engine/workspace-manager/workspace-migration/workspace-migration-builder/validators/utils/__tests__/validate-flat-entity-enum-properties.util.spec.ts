import {
  AggregateOperations,
  FieldMetadataType,
  MetadataWritability,
  ViewOpenRecordIn,
  ViewType,
} from 'twenty-shared/types';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { validateFlatEntityEnumProperties } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-entity-enum-properties.util';

const CONFIGURED_ENUM_VALUES = Object.entries(
  ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
).flatMap(([metadataName, propertiesConfiguration]) =>
  (
    Object.entries(propertiesConfiguration) as [
      string,
      { enum?: { values: object } },
    ][]
  ).flatMap(([property, configuration]) =>
    configuration.enum === undefined
      ? []
      : [[`${metadataName}.${property}`, configuration.enum.values] as const],
  ),
);

const validateView = (flatView: Record<string, unknown>) =>
  validateFlatEntityEnumProperties({
    metadataName: 'view',
    flatEntity: flatView,
  });

describe('validateFlatEntityEnumProperties', () => {
  it.each(CONFIGURED_ENUM_VALUES)(
    'should load the values of %s',
    (_, values) => {
      expect(Object.values(values).length).toBeGreaterThan(0);
    },
  );

  it('should accept enum members', () => {
    expect(
      validateView({
        type: ViewType.KANBAN,
        openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
        kanbanAggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual([]);
  });

  it('should skip undefined properties', () => {
    expect(validateView({})).toEqual([]);
  });

  it('should accept null only for nullable properties', () => {
    expect(validateView({ kanbanAggregateOperation: null })).toEqual([]);

    expect(validateView({ openRecordIn: null })).toMatchObject([
      {
        code: FlatEntityMapsExceptionCode.INVALID_ENUM_VALUE,
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
    expect(validateView({ type: value })).toMatchObject([
      {
        code: FlatEntityMapsExceptionCode.INVALID_ENUM_VALUE,
        message: expect.stringContaining(
          `Invalid value ${JSON.stringify(value)} for type, expected one of: TABLE,`,
        ),
        value,
      },
    ]);
  });

  it('should return one error per invalid property', () => {
    const errors = validateView({
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

  it('should validate properties restricted to a subset of an enum', () => {
    const validateApplicationVariableType = (type: string) =>
      validateFlatEntityEnumProperties({
        metadataName: 'applicationVariable',
        flatEntity: { type },
      });

    expect(validateApplicationVariableType(FieldMetadataType.TEXT)).toEqual([]);
    expect(
      validateApplicationVariableType(FieldMetadataType.RELATION),
    ).toHaveLength(1);
  });
});
