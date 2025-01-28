import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export const isRelationFieldMetadata = (
  fieldMetadata: FieldMetadataInterface<'default' | FieldMetadataType.RELATION>,
): fieldMetadata is FieldMetadataInterface<FieldMetadataType.RELATION> => {
  return fieldMetadata.type === FieldMetadataType.RELATION;
};
