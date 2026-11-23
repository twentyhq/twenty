import {
  type AllFieldMetadataSettings,
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isFieldMetadataSettingsOfType = <
  T extends keyof FieldMetadataSettingsMapping,
>(
  settings: AllFieldMetadataSettings | null,
  fieldMetadataType: T,
): settings is FieldMetadataSettingsMapping[T] => {
  if (fieldMetadataType === FieldMetadataType.ROLLUP) {
    return isDefined(settings) && 'aggregateOperation' in settings;
  }

  // Settings don't have a discriminator - the type is determined by fieldMetadataType
  if (
    fieldMetadataType === FieldMetadataType.RELATION ||
    fieldMetadataType === FieldMetadataType.MORPH_RELATION ||
    fieldMetadataType === FieldMetadataType.FILES
  ) {
    return isDefined(settings);
  }

  return true;
};

export const isUniversalFieldMetadataSettingsOftype = <
  T extends keyof FieldMetadataSettingsMapping,
>(
  settings: UniversalFlatFieldMetadata['universalSettings'],
  fieldMetadataType: T,
): settings is UniversalFlatFieldMetadata<T>['universalSettings'] => {
  if (fieldMetadataType === FieldMetadataType.ROLLUP) {
    return isDefined(settings) && 'aggregateOperation' in settings;
  }

  // Settings don't have a discriminator - the type is determined by fieldMetadataType
  if (
    fieldMetadataType === FieldMetadataType.RELATION ||
    fieldMetadataType === FieldMetadataType.MORPH_RELATION ||
    fieldMetadataType === FieldMetadataType.FILES
  ) {
    return isDefined(settings);
  }

  return true;
};
