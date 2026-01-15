import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';

export const formatDimensionValue = (
  value: RawDimensionValue,
  fieldMetadata: FlatFieldMetadata,
  selectOptions: FieldMetadataOption[] | null,
): string => {
  if (!isDefined(value)) {
    return 'Not Set';
  }

  if (
    fieldMetadata.type === FieldMetadataType.SELECT &&
    isDefined(selectOptions)
  ) {
    const selectedOption = selectOptions.find(
      (option) => option.value === value,
    );

    return selectedOption?.label ?? String(value);
  }

  if (fieldMetadata.type === FieldMetadataType.BOOLEAN) {
    return value === true ? 'Yes' : 'No';
  }

  return String(value);
};
