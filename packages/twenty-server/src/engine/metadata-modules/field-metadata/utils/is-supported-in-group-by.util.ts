import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const NON_GROUPABLE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TS_VECTOR,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.FILES,
  FieldMetadataType.POSITION,
]);

export const isFlatFieldMetadataSupportedInGroupBy = (
  fieldMetadata: FlatFieldMetadata,
): boolean => {
  return !NON_GROUPABLE_FIELD_TYPES.has(fieldMetadata.type);
};

export const isCompositePropertySupportedInGroupBy = (
  property: CompositeProperty,
): boolean => {
  return (
    property.hidden !== true && property.type !== FieldMetadataType.RAW_JSON
  );
};
