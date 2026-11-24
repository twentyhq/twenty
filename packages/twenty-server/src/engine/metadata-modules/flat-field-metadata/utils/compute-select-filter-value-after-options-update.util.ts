import { isNonEmptyString } from '@sniptt/guards';
import {
  type EnumFieldMetadataType,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { parseSelectFilterValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

type EnumFieldMetadataOption =
  FlatFieldMetadata<EnumFieldMetadataType>['options'][number];

// Undefined leaves the filter untouched; an empty list means none of its options is left
export const computeSelectFilterValueAfterOptionsUpdate = ({
  operand,
  subFieldName,
  value,
  fromOptions,
  deletedOptions,
  updatedOptions,
}: {
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value: ViewFilterValue | null;
  fromOptions: FlatFieldMetadata<EnumFieldMetadataType>['options'];
  deletedOptions: EnumFieldMetadataOption[];
  updatedOptions: {
    from: EnumFieldMetadataOption;
    to: EnumFieldMetadataOption;
  }[];
}): string[] | undefined => {
  if (
    !isDefined(value) ||
    !isRecordFilterOperandExpectingValue(operand) ||
    isNonEmptyString(subFieldName)
  ) {
    return undefined;
  }

  const filterValues = parseSelectFilterValues(value);

  if (!isDefined(filterValues)) {
    return undefined;
  }

  return filterValues
    .map((filterValue) =>
      fromOptions.find((option) => option.value === filterValue),
    )
    .filter(isDefined)
    .filter(
      (filterOption) =>
        !deletedOptions.some((option) => option.value === filterOption.value),
    )
    .map(
      (filterOption) =>
        updatedOptions.find(({ from }) => from.value === filterOption.value)?.to
          .value ?? filterOption.value,
    );
};
