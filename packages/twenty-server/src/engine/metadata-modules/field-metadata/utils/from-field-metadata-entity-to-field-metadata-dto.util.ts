import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fromFieldMetadataEntityToFieldMetadataDto = (
  fieldMetadataEntity: FieldMetadataEntity,
): FieldMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    standardOverrides,
    isNullable,
    isUnique,
    settings,
    ...rest
  } = fieldMetadataEntity;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    standardOverrides: standardOverrides ?? undefined,
    isNullable: isNullable ?? false,
    isUnique: isUnique ?? false,
    settings: settings ?? undefined,
  };
};
