import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import {
  COMPOSITE_SUB_FIELD_VALUE_SCHEMAS,
  FILTER_VALUE_SCHEMAS_MAP,
} from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';
import { isFilterValueExpectedAsArray } from '@/utils/filter/utils/validation-schemas/isFilterValueExpectedAsArray';

const findFilterTypesExpectingArray = () =>
  Object.entries(FILTER_VALUE_SCHEMAS_MAP)
    .filter(([filterType, operandSchemas]) =>
      Object.keys(operandSchemas).some((operand) =>
        isFilterValueExpectedAsArray({
          filterType: filterType as FilterableAndTSVectorFieldType,
          operand: operand as ViewFilterOperand,
        }),
      ),
    )
    .map(([filterType]) => filterType)
    .sort();

const findSubFieldsExpectingArray = () =>
  Object.entries(COMPOSITE_SUB_FIELD_VALUE_SCHEMAS)
    .flatMap(([filterType, subFieldSchemas]) =>
      Object.entries(subFieldSchemas)
        .filter(([subFieldName, operandSchemas]) =>
          Object.keys(operandSchemas).some((operand) =>
            isFilterValueExpectedAsArray({
              filterType: filterType as FilterableAndTSVectorFieldType,
              operand: operand as ViewFilterOperand,
              subFieldName,
            }),
          ),
        )
        .map(([subFieldName]) => `${filterType}.${subFieldName}`),
    )
    .sort();

describe('isFilterValueExpectedAsArray', () => {
  it('should find the filter types whose value is an array', () => {
    expect(findFilterTypesExpectingArray()).toEqual([
      'MULTI_SELECT',
      'RELATION',
      'SELECT',
      'UUID',
    ]);
  });

  it('should find the composite sub fields whose value is an array', () => {
    expect(findSubFieldsExpectingArray()).toEqual([
      'ACTOR.source',
      'ACTOR.workspaceMemberId',
      'ADDRESS.addressCountry',
      'CURRENCY.currencyCode',
    ]);
  });
});
