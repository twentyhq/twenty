import { isDeepStrictEqual } from 'util';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';

export const isValidUniqueFieldDefaultValueCombination = (
  defaultValue: FieldMetadataDefaultValue,
  isUnique: boolean,
  type: FieldMetadataType,
) => {
  const defaultDefaultValue = generateDefaultValue(type);

  if (
    isUnique === false ||
    isDeepStrictEqual(defaultValue, defaultDefaultValue)
  ) {
    return true;
  }

  return false;
};
