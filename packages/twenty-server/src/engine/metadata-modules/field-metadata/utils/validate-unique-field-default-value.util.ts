import { isDeepStrictEqual } from 'util';

import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';

export const validateUniqueFieldDefaultValue = (
  defaultValue: FieldMetadataDefaultValue | undefined,
  isUnique: boolean | undefined,
  type: FieldMetadataType,
) => {
  const standardDefaultValue = generateDefaultValue(type);

  if (
    !isDefined(isUnique) ||
    isUnique === false ||
    !isDefined(defaultValue) ||
    isDeepStrictEqual(defaultValue, standardDefaultValue)
  ) {
    return true;
  }

  return false;
};
