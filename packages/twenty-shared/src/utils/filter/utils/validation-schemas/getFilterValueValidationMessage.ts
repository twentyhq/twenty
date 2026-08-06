import { type FieldMetadataType, type ViewFilterOperand } from '@/types';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { convertViewFilterValueToString } from '@/utils/filter/utils/convertViewFilterValueToString';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { FILTER_VALUE_FORMAT_HINTS } from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

// Single write-time contract for anything storing a filter value: view filters
// and row level permission predicates both resolve the same schema, and only map
// the message onto their own exception code.
export const getFilterValueValidationMessage = ({
  fieldType,
  operand,
  subFieldName,
  value,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value: unknown;
}): string | undefined => {
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

  if (
    !isDefined(valueSchema) ||
    valueSchema.safeParse(stringifiedValue).success
  ) {
    return undefined;
  }

  const hint = FILTER_VALUE_FORMAT_HINTS[operand];

  return [
    `Value "${stringifiedValue}" is not valid for operand "${operand}" on field type "${filterType}".`,
    hint,
  ]
    .filter(isDefined)
    .join(' ');
};
