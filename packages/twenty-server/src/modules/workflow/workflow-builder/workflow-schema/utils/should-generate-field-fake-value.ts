import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const isManyToOneRelationField = (field: FieldMetadataEntity) =>
  (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
    ?.relationType === 'MANY_TO_ONE';

const EXCLUDED_SYSTEM_FIELDS = ['searchVector', 'position'];

// TODO refactor
export const shouldGenerateFieldFakeValue = <T extends FieldMetadataType>(
  field: FieldMetadataEntity<T>,
) => {
  return (
    field.isActive &&
    !(EXCLUDED_SYSTEM_FIELDS.includes(field.name) && field.isSystem) &&
    (field.type !== FieldMetadataType.RELATION ||
      isManyToOneRelationField(field as unknown as FieldMetadataEntity))
  );
};
