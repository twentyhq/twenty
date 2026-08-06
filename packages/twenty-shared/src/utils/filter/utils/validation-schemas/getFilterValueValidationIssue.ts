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
