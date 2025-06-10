import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const isManyToOneRelationField = (field: FieldMetadataInterface) =>
  (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
    ?.relationType === 'MANY_TO_ONE';

export const shouldGenerateFieldFakeValue = (field: FieldMetadataInterface) => {
  return (
    field.isActive &&
    (!field.isSystem || field.name === 'id' || field.name === 'userEmail') &&
    (field.type !== FieldMetadataType.RELATION ||
      isManyToOneRelationField(field))
  );
};
