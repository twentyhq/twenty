import { ObjectMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/object-metadata.interface';

import { isCompositeFieldMetadataType } from 'src/workspace/utils/is-composite-field-metadata-type.util';

export const objectContainsCompositeField = (
  objectMetadata: ObjectMetadataInterface,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isCompositeFieldMetadataType(field.type),
  );
};
