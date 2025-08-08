import { isDeepStrictEqual } from 'util';

import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';

export const isValidUniqueFieldDefaultValueCombination = ({
  defaultValue,
  isUnique,
  type,
}: {
  defaultValue: FieldMetadataDefaultValue;
  isUnique: boolean;
  type: FieldMetadataType;
}) => {
  const defaultDefaultValue = generateDefaultValue(type);

  return !isUnique || isDeepStrictEqual(defaultValue, defaultDefaultValue);
};
