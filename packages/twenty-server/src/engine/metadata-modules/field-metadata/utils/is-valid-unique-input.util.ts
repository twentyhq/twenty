import {
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const isValidUniqueFieldDefaultValueCombination = ({
  defaultValue,
  isUnique,
  type,
}: {
  defaultValue: FieldMetadataDefaultValue;
  isUnique: boolean;
  type: FieldMetadataType;
}) => {
  if (!isUnique) return true;

  const defaultDefaultValue = generateDefaultValue(type);

  if (!isCompositeFieldMetadataType(type))
    return defaultValue === defaultDefaultValue;

  const doUniquePropertiesHaveDefaultValues =
    compositeTypeDefinitions
      .get(type)
      ?.properties.filter((property) => property.isIncludedInUniqueConstraint)
      .every(
        ({ name }) =>
          (defaultValue as Record<string, string | null>)?.[name] ===
          (defaultDefaultValue as Record<string, string | null>)?.[name],
      ) ?? false;

  return doUniquePropertiesHaveDefaultValues;
};
