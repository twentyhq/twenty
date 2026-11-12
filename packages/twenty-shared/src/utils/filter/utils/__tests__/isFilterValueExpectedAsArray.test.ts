import {
  FILTERABLE_FIELD_TYPES,
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand,
} from '@/types';
import { COMPOSITE_SUB_FIELD_VALUE_SCHEMAS } from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';
import { isFilterValueExpectedAsArray } from '@/utils/filter/utils/validation-schemas/isFilterValueExpectedAsArray';

const FILTER_TYPES: FilterableAndTSVectorFieldType[] = [
  ...FILTERABLE_FIELD_TYPES,
  'TS_VECTOR',
];
const SUB_FIELD_SCHEMAS_BY_FILTER_TYPE: Partial<
  Record<FilterableAndTSVectorFieldType, Record<string, unknown>>
> = COMPOSITE_SUB_FIELD_VALUE_SCHEMAS;

const isExpectedAsArrayForSomeOperand = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string;
}) =>
  Object.values(ViewFilterOperand).some((operand) =>
    isFilterValueExpectedAsArray({ filterType, operand, subFieldName }),
  );

describe('isFilterValueExpectedAsArray', () => {
  it('should find the filter types whose value is an array', () => {
    expect(
      FILTER_TYPES.filter((filterType) =>
        isExpectedAsArrayForSomeOperand({ filterType }),
      ).sort(),
    ).toEqual(['MULTI_SELECT', 'RELATION', 'SELECT', 'UUID']);
  });

  it('should find the composite sub fields whose value is an array', () => {
    expect(
      FILTER_TYPES.flatMap((filterType) =>
        Object.keys(SUB_FIELD_SCHEMAS_BY_FILTER_TYPE[filterType] ?? {})
          .filter((subFieldName) =>
            isExpectedAsArrayForSomeOperand({ filterType, subFieldName }),
          )
          .map((subFieldName) => `${filterType}.${subFieldName}`),
      ).sort(),
    ).toEqual([
      'ACTOR.source',
      'ACTOR.workspaceMemberId',
      'ADDRESS.addressCountry',
      'CURRENCY.currencyCode',
    ]);
  });
});
