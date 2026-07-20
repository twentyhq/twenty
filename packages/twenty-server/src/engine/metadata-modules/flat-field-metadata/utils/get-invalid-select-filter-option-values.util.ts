import { isArray, isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

export const normalizeSelectFilterValues = (
  value: ViewFilterValue | null,
): string[] => {
  // TODO: Remove legacy scalar/stringified-value support after all view filter
  // values have been migrated to their canonical JSON representation.
  if (isArray(value)) {
    return value.filter(isNonEmptyString);
  }

  if (!isNonEmptyString(value)) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (isArray(parsedValue)) {
      return parsedValue.filter(isNonEmptyString);
    }
  } catch {
    // Not a JSON-stringified array — treat the raw string as a single value.
  }

  return [value];
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

  const filterValues = normalizeSelectFilterValues(value);

  if (filterValues.length === 0) {
    return [];
  }

  if (!isDefined(fieldMetadata.options)) {
    return filterValues;
  }

  return filterValues.filter((filterValue) =>
    fieldMetadata.options.every((option) => option.value !== filterValue),
  );
};
