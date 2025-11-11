import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const validateCanCreateUniqueIndex = (
  field: Pick<FieldMetadataEntity, 'type' | 'name'>,
) => {
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
  ) {
    const fieldType = field.type;

    throw new FieldMetadataException(
      `Unique index cannot be created for field ${field.name} of type ${fieldType}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      {
        userFriendlyMessage: msg`${fieldType} fields cannot be unique.`,
      },
    );
  }
};
