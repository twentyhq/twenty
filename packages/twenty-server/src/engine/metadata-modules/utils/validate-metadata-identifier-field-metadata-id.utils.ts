import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
  isValidUuid,
} from 'twenty-shared/utils';

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
    {
      validator: ({ identifierFieldMetadataId }) =>
        !isValidUuid(identifierFieldMetadataId),
      label: 'identifierFieldMetadataId must be a valid uuid',
    },
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

type ValidateMetadataFieldIdentifiersArgs = {
  labelIdentifierFieldMetadataId: string | undefined;
  imageIdentifierFieldMetadataId: string | undefined;
  fieldMetadataItems: FieldMetadataEntity[] | FieldMetadataInterface[];
};
export const validateMetadataIdentifierFields = ({
  imageIdentifierFieldMetadataId,
  labelIdentifierFieldMetadataId,
  fieldMetadataItems,
}: ValidateMetadataFieldIdentifiersArgs) => {
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
