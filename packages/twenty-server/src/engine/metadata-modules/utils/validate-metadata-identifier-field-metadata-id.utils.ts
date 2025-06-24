import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type Validator = {
  validator: (args: {
    identifierFieldMetadataId: string;
    matchingFieldMetadata?: FieldMetadataEntity | FieldMetadataInterface;
  }) => boolean;
  label: string;
};

type ValidateMetadataIdentifierFieldMetadataIdOrThrowArgs = {
  identifierFieldMetadataId?: string;
  fieldMetadataItems: FieldMetadataEntity[] | FieldMetadataInterface[];
  customValidators?: Validator[];
};
const validateMetadataIdentifierFieldMetadataIdOrThrow = ({
  identifierFieldMetadataId,
  fieldMetadataItems,
  customValidators,
}: ValidateMetadataIdentifierFieldMetadataIdOrThrowArgs): void => {
  if (!isDefined(identifierFieldMetadataId)) {
    return;
  }
  const matchingFieldMetadata = fieldMetadataItems.find(
    (fieldMetadata) => fieldMetadata.id === identifierFieldMetadataId,
  );

  const validators: Array<Validator> = [
    // TODO We should programmatically run the UpdateObjectPayload validation here
    {
      validator: ({ matchingFieldMetadata }) =>
        !isDefined(matchingFieldMetadata),
      label: 'related field metadata not found',
    },
    ...(customValidators ?? []),
  ];

  validators.forEach(({ label, validator }) => {
    if (validator({ identifierFieldMetadataId, matchingFieldMetadata })) {
      throw new ObjectMetadataException(
        `identifierFieldMetadataId validation failed: ${label}`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }
  });
};

type ValidateMetadataIdentifierFieldMetadataIdsArgs = {
  labelIdentifierFieldMetadataId: string | undefined;
  imageIdentifierFieldMetadataId: string | undefined;
  fieldMetadataItems: FieldMetadataEntity[] | FieldMetadataInterface[];
};
export const validateMetadataIdentifierFieldMetadataIds = ({
  imageIdentifierFieldMetadataId,
  labelIdentifierFieldMetadataId,
  fieldMetadataItems,
}: ValidateMetadataIdentifierFieldMetadataIdsArgs) => {
  const fieldIdentifierToValidate: Array<{
    fieldIdentifier: string | undefined;
    customValidators?: Validator[];
  }> = [
    {
      fieldIdentifier: labelIdentifierFieldMetadataId,
      customValidators: [
        {
          validator: ({ matchingFieldMetadata }) =>
            isDefined(matchingFieldMetadata) &&
            !isLabelIdentifierFieldMetadataTypes(matchingFieldMetadata.type),
          label:
            'identifierFieldMetadataId must be a TEXT or FULL_NAME field metadata type id',
        },
      ],
    },
    {
      fieldIdentifier: imageIdentifierFieldMetadataId,
    },
  ];

  fieldIdentifierToValidate.forEach(({ fieldIdentifier, customValidators }) =>
    validateMetadataIdentifierFieldMetadataIdOrThrow({
      identifierFieldMetadataId: fieldIdentifier,
      fieldMetadataItems,
      customValidators,
    }),
  );
};
