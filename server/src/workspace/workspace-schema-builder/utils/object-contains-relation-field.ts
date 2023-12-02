import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { isRelationFieldMetadataType } from 'src/workspace/utils/is-relation-field-metadata-type.util';

export const objectContainsRelationField = (
  objectMetadata: ObjectMetadataInterface,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isRelationFieldMetadataType(field.type),
  );
};
