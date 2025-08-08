import { FieldMetadataType } from 'twenty-shared/types';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const shouldCreateUniqueIndexOrThrow = (
  field: CreateFieldInput | FieldMetadataEntity,
) => {
  if (field.isCustom === false)
    throw new FieldMetadataException(
      `Unique index cannot be created on standard field`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );

  const isCompositeFieldWithNonIncludedUniqueConstraint =
    isCompositeFieldMetadataType(field.type) &&
    !compositeTypeDefinitions
      .get(field.type)
      ?.properties.some((property) => property.isIncludedInUniqueConstraint);

  if (
    [FieldMetadataType.MORPH_RELATION, FieldMetadataType.RELATION].includes(
      field.type,
    ) ||
    isCompositeFieldWithNonIncludedUniqueConstraint
  )
    throw new FieldMetadataException(
      `Unique index cannot be created for field ${field.name} of type ${field.type}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );

  return true;
};
