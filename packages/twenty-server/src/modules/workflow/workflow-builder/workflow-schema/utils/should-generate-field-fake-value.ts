import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const isManyToOneRelationField = (field: FieldMetadataEntity) =>
  (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
    ?.relationType === 'MANY_TO_ONE';

// TODO refactor
export const shouldGenerateFieldFakeValue = <T extends FieldMetadataType>(
  field: FieldMetadataEntity<T>,
) => {
  return (
    field.isActive &&
    (!field.isSystem || field.name === 'id' || field.name === 'userEmail') &&
    (field.type !== FieldMetadataType.RELATION ||
      isManyToOneRelationField(field as unknown as FieldMetadataEntity))
  );
};
