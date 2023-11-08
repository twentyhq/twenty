import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { isCompositeFieldMetadataType } from 'src/tenant/utils/is-composite-field-metadata-type.util';

export const objectContainsCompositeField = (
  objectMetadata: ObjectMetadataInterface,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isCompositeFieldMetadataType(field.type),
  );
};
