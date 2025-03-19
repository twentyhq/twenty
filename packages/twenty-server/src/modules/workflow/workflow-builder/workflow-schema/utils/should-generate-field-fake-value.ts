import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataType } from 'twenty-shared/types';

export const shouldGenerateFieldFakeValue = (field: FieldMetadataEntity) => {
  return (
    (!field.isSystem || field.name === 'id') &&
    field.isActive &&
    field.type !== FieldMetadataType.RELATION
  );
};
