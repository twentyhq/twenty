import { type FieldMetadataType } from 'twenty-shared/types';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const getCompositeTypeOrThrow = (
  fieldType: FieldMetadataType,
): CompositeType => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new FieldMetadataException(
      `Composite type not found for field metadata type: ${fieldType}`,
      FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
    );
  }

  return compositeType;
};
