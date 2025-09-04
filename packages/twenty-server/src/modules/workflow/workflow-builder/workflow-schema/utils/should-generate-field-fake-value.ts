import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const isManyToOneRelationField = (field: FieldMetadataEntity) =>
  (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
    ?.relationType === 'MANY_TO_ONE';

// TODO refactor
export const shouldGenerateFieldFakeValue = <T extends FieldMetadataType>(
  field: FieldMetadataEntity<T>,
) => {
  return (
    field.isActive &&
    field.name !== 'searchVector' &&
    (field.type !== FieldMetadataType.RELATION ||
      isManyToOneRelationField(field as unknown as FieldMetadataEntity))
  );
};
