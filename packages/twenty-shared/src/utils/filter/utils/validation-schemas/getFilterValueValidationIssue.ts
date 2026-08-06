import {
  type FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { convertViewFilterValueToString } from '@/utils/filter/utils/convertViewFilterValueToString';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { FILTER_VALUE_FORMAT_HINTS } from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

export type FilterValueValidationIssue = {
  stringifiedValue: string;
  operand: ViewFilterOperand;
  filterType: FilterableAndTSVectorFieldType;
  hint: string;
};

// Single write-time contract for anything storing a filter value. The parts are
// returned rather than an assembled sentence so callers keep a literal
// translatable template.
export const getFilterValueValidationIssue = ({
  fieldType,
  operand,
  subFieldName,
  value,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value: unknown;
}): FilterValueValidationIssue | undefined => {
  const stringifiedValue = convertViewFilterValueToString(value);

  // An operand still awaiting its value is a filter being built, which the read
  // path ignores rather than rejects.
  if (!isRecordFilterValueValid({ operand, value: stringifiedValue })) {
    return undefined;
  }

  const filterType = getFilterTypeFromFieldType(fieldType);

  const valueSchema = getFilterValueSchema({
    filterType,
    operand,
    subFieldName,
  });

  if (!isDefined(valueSchema)) {
    return undefined;
  }

  if (valueSchema.safeParse(stringifiedValue).success) {
    return undefined;
  }

  return {
    stringifiedValue,
    operand,
    filterType,
    hint: FILTER_VALUE_FORMAT_HINTS[operand] ?? '',
  };
};
