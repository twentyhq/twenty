import { isArray, isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';
import {
  arrayOfStringsOrVariablesSchema,
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

export const parseSelectFilterValues = (
  value: ViewFilterValue | null,
): string[] | undefined => {
  if (isArray(value)) {
    return value.filter(isNonEmptyString);
  }

  if (!isNonEmptyString(value)) {
    return [];
  }

  const parsedValue = arrayOfStringsOrVariablesSchema.safeParse(value);

  return parsedValue.success
    ? parsedValue.data.filter(isNonEmptyString)
    : undefined;
};

export const getInvalidSelectFilterOptionValues = ({
  fieldMetadata,
  operand,
  subFieldName,
  value,
}: {
  fieldMetadata: Pick<
    FlatFieldMetadata<
      FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
    >,
    'type' | 'options'
  >;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value: ViewFilterValue | null;
}): string[] => {
  if (!isRecordFilterOperandExpectingValue(operand)) {
    return [];
  }

  if (isNonEmptyString(subFieldName)) {
    return [];
  }

  const filterValues = parseSelectFilterValues(value);

  if (!isDefined(filterValues) || filterValues.length === 0) {
    return [];
  }

  if (!isDefined(fieldMetadata.options)) {
    return filterValues;
  }

  return filterValues.filter((filterValue) =>
    fieldMetadata.options.every((option) => option.value !== filterValue),
  );
};
