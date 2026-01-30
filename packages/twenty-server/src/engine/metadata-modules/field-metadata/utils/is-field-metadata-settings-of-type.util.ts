import {
  type AllFieldMetadataSettings,
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isFieldMetadataSettingsOfType = <
  T extends keyof FieldMetadataSettingsMapping,
>(
  settings: AllFieldMetadataSettings | null,
  fieldMetadataType: T,
): settings is FieldMetadataSettingsMapping[T] => {
  // Settings don't have a discriminator - the type is determined by fieldMetadataType
  // For required settings types (RELATION, MORPH_RELATION, FILES), ensure settings is defined
  if (
    fieldMetadataType === FieldMetadataType.RELATION ||
    fieldMetadataType === FieldMetadataType.MORPH_RELATION ||
    fieldMetadataType === FieldMetadataType.FILES
  ) {
    return isDefined(settings);
  }

  return true;
};
