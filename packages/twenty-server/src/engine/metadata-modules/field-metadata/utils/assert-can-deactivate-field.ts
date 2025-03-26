import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type AssertCanDeactivateFieldOptions = {
  isActiveInput?: boolean;
  labelIdentifierFieldMetadataId: string;
  existingFieldMetadata: FieldMetadataInterface;
};

export const assertCanDeactivateField = ({
  isActiveInput,
  labelIdentifierFieldMetadataId,
  existingFieldMetadata,
}: AssertCanDeactivateFieldOptions) => {
  if (isActiveInput === true) {
    return;
  }

  if (existingFieldMetadata.id === labelIdentifierFieldMetadataId) {
    throw new FieldMetadataException(
      'Cannot deactivate label identifier field',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  if (
    ['deletedAt', 'createdAt', 'updatedAt'].includes(existingFieldMetadata.name)
  ) {
    throw new FieldMetadataException(
      'Cannot deactivate createdAt, updatedAt or deletedAt field',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
};
