import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type Validator = {
  validator: (args: {
    fieldMetadataId: string;
    matchingFieldMetadata?: FieldMetadataEntity;
  }) => boolean;
  label: string;
};

type ValidateMetadataIdentifierFieldMetadataIdOrThrowArgs = {
  fieldMetadataId: string;
  fieldMetadataItems: FieldMetadataEntity[];
  validators: Validator[];
};
const validatorRunner = ({
  fieldMetadataId,
  fieldMetadataItems,
  validators,
}: ValidateMetadataIdentifierFieldMetadataIdOrThrowArgs): void => {
  const matchingFieldMetadata = fieldMetadataItems.find(
    (fieldMetadata) => fieldMetadata.id === fieldMetadataId,
  );

  validators.forEach(({ label, validator }) => {
    if (validator({ fieldMetadataId, matchingFieldMetadata })) {
      throw new ObjectMetadataException(
        label,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }
  });
};

type ValidateMetadataIdentifierFieldMetadataIdsArgs = {
  labelIdentifierFieldMetadataId: string | undefined;
  imageIdentifierFieldMetadataId: string | undefined;
  fieldMetadataItems: FieldMetadataEntity[];
};
export const validateMetadataIdentifierFieldMetadataIds = ({
  imageIdentifierFieldMetadataId,
  labelIdentifierFieldMetadataId,
  fieldMetadataItems,
}: ValidateMetadataIdentifierFieldMetadataIdsArgs) => {
  const isMatchingFieldMetadataDefined: Validator['validator'] = ({
    matchingFieldMetadata,
  }) => !isDefined(matchingFieldMetadata);

  if (isDefined(labelIdentifierFieldMetadataId)) {
    validatorRunner({
      fieldMetadataId: labelIdentifierFieldMetadataId,
      fieldMetadataItems,
      validators: [
        {
          validator: isMatchingFieldMetadataDefined,
          label:
            'labelIdentifierFieldMetadataId validation failed: related field metadata not found',
        },
        {
          validator: ({ matchingFieldMetadata }) =>
            isDefined(matchingFieldMetadata) &&
            !isLabelIdentifierFieldMetadataTypes(matchingFieldMetadata.type),
          label:
            'labelIdentifierFieldMetadataId validation failed: it must be a TEXT or FULL_NAME field metadata type id',
        },
      ],
    });
  }

  if (isDefined(imageIdentifierFieldMetadataId)) {
    validatorRunner({
      fieldMetadataId: imageIdentifierFieldMetadataId,
      fieldMetadataItems,
      validators: [
        {
          validator: isMatchingFieldMetadataDefined,
          label:
            'imageIdentifierFieldMetadataId validation failed: related field metadata not found',
        },
      ],
    });
  }
};
