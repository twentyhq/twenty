import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const shouldCreateUniqueIndex = (
  isUnique: boolean | undefined,
  field: CreateFieldInput | FieldMetadataEntity,
) => {
  if (isUnique !== true) return false;

  if (
    [FieldMetadataType.MORPH_RELATION, FieldMetadataType.ACTOR].includes(
      field.type,
    ) ||
    (isCompositeFieldMetadataType(field.type) &&
      !compositeTypeDefinitions
        .get(field.type)
        ?.properties.some(
          (property) => property.isIncludedInUniqueConstraint,
        )) ||
    (field.type === FieldMetadataType.RELATION &&
      (
        field as
          | FieldMetadataDTO<FieldMetadataType.RELATION>
          | FieldMetadataEntity<FieldMetadataType.RELATION>
      ).settings?.relationType === RelationType.ONE_TO_MANY)
  )
    throw new FieldMetadataException(
      `Unique index cannot be created for field ${field.name} of type ${field.type}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );

  return true;
};
