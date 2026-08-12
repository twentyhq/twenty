import {
  FieldMetadataType,
  type UniversalChartFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validateChartFilter } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-chart-filter.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const DATE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-000000000001';
const SELECT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';
const UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-9999-4999-8999-000000000009';

const flatFieldMetadata = (
  universalIdentifier: string,
  type: FieldMetadataType,
) => ({
  universalIdentifier,
  type,
  label: 'Some field',
  isActive: true,
});

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [DATE_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata(
      DATE_FIELD_UNIVERSAL_IDENTIFIER,
      FieldMetadataType.DATE,
    ),
    [SELECT_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata(
      SELECT_FIELD_UNIVERSAL_IDENTIFIER,
      FieldMetadataType.SELECT,
    ),
    [RELATION_FIELD_UNIVERSAL_IDENTIFIER]: flatFieldMetadata(
      RELATION_FIELD_UNIVERSAL_IDENTIFIER,
      FieldMetadataType.RELATION,
    ),
  },
} as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>;

const validateFilter = (recordFilters: UniversalChartFilter['recordFilters']) =>
  validateChartFilter({
    filter: { recordFilters },
    widgetTitle: 'Deals per month',
    flatFieldMetadataMaps,
  });

describe('validateChartFilter', () => {
  it('should accept a valid stringified relative date on a DATE field', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'NEXT_30_DAY',
      },
    ]);

    expect(errors).toHaveLength(0);
  });

  // The reported case of #23397, reachable through widget filters
  it('should reject the object form of a relative date on a DATE field', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: JSON.stringify({
          direction: 'NEXT',
          amount: 30,
          unit: 'DAY',
        }),
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not valid for operand');
    expect(errors[0].message).toContain('Deals per month');
    expect(errors[0].message).toContain('NEXT_30_DAY');
  });

  it('should reject an operand that is not supported by the field type', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.VECTOR_SEARCH,
        value: 'anything',
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not supported on field type');
  });

  it('should reject an operand that is not a known operand at all', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: 'NOT_AN_OPERAND',
        value: 'anything',
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not supported on field type');
  });

  it('should resolve the relation target field type to validate the value', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'not-a-relative-date',
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('DATE');
  });

  it('should report an error per invalid filter', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'nope',
      },
      {
        fieldMetadataUniversalIdentifier: SELECT_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.VECTOR_SEARCH,
        value: 'nope',
      },
    ]);

    expect(errors).toHaveLength(2);
  });

  it('should skip a filter whose field is unknown, the transpilation reports it', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: UNKNOWN_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS,
        value: 'anything',
      },
    ]);

    expect(errors).toHaveLength(0);
  });

  it('should report a filter without any field reference', () => {
    const errors = validateFilter([
      {
        fieldMetadataUniversalIdentifier: null,
        operand: ViewFilterOperand.IS,
        value: 'anything',
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no field metadata');
  });

  it('should accept a configuration without any filter', () => {
    const errors = validateChartFilter({
      filter: undefined,
      widgetTitle: 'Deals per month',
      flatFieldMetadataMaps,
    });

    expect(errors).toHaveLength(0);
  });
});
