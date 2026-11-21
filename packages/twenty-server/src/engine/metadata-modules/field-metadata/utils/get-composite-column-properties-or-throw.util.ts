import {
  type CompositeProperty,
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { getCompositeColumnProperties } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-column-properties.util';

export const getCompositeColumnPropertiesOrThrow = (
  fieldType: FieldMetadataType,
): CompositeProperty[] => {
  if (!compositeTypeDefinitions.has(fieldType)) {
    throw new FieldMetadataException(
      `Composite type not found for field metadata type: ${fieldType}`,
      FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
    );
  }

  return getCompositeColumnProperties(fieldType);
};
