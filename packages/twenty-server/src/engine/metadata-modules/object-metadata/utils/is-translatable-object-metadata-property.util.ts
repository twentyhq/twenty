import {
  type ObjectMetadataTranslatableProperty,
  OBJECT_METADATA_TRANSLATABLE_PROPERTIES,
} from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-translatable-properties.constant';
import type { ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';

export const isObjectMetadataPropertyTranslatable = (
  property: ObjectMetadataStandardOverridesProperties,
): property is ObjectMetadataTranslatableProperty => {
  return OBJECT_METADATA_TRANSLATABLE_PROPERTIES.includes(
    property as ObjectMetadataTranslatableProperty,
  );
};
