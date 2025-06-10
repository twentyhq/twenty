import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type CheckCanDeactivateFieldOptions = {
  labelIdentifierFieldMetadataId: string;
  existingFieldMetadata: Pick<
    FieldMetadataInterface,
    'id' | 'isSystem' | 'name'
  >;
};

export const checkCanDeactivateFieldOrThrow = ({
  labelIdentifierFieldMetadataId,
  existingFieldMetadata,
}: CheckCanDeactivateFieldOptions) => {
  if (existingFieldMetadata.id === labelIdentifierFieldMetadataId) {
    throw new FieldMetadataException(
      'Cannot deactivate label identifier field',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  if (existingFieldMetadata.isSystem === true) {
    throw new FieldMetadataException(
      'Cannot deactivate system field',
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
