import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

const isManyToOneRelationField = (field: FlatFieldMetadata) => {
  if (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION)) {
    return field.settings?.relationType === RelationType.MANY_TO_ONE;
  }

  return false;
};

const EXCLUDED_SYSTEM_FIELDS = ['searchVector', 'position'];

export const shouldGenerateFieldFakeValue = (field: FlatFieldMetadata) => {
  return (
    field.isActive &&
    !(EXCLUDED_SYSTEM_FIELDS.includes(field.name) && field.isSystem) &&
    !isManyToOneRelationField(field)
  );
};
