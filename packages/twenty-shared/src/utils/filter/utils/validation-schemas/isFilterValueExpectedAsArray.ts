import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { ARRAY_FILTER_VALUE_SCHEMAS } from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

export const isFilterValueExpectedAsArray = ({
  filterType,
  operand,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  operand: ViewFilterOperand;
  subFieldName?: string | null | undefined;
}): boolean => {
  const valueSchema = getFilterValueSchema({
    filterType,
    operand,
    subFieldName,
  });

  return isDefined(valueSchema) && ARRAY_FILTER_VALUE_SCHEMAS.has(valueSchema);
};
