import { isDefined } from 'twenty-shared/utils';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateMetadataNameIsNotTooLongOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-long.utils';
import { validateMetadataNameIsNotTooShortOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-short.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

export const validateObjectMetadataInputNamesOrThrow = <
  T extends UpdateObjectPayload | CreateObjectInput,
>({
  namePlural,
  nameSingular,
}: T): void =>
  [namePlural, nameSingular].forEach((name) => {
    if (!isDefined(name)) {
      return;
    }
    validateObjectMetadataInputNameOrThrow(name);
  });

export const validateObjectMetadataInputNameOrThrow = (name: string): void => {
  try {
    validateMetadataNameOrThrow(name);
  } catch (error) {
    if (error instanceof InvalidMetadataException) {
      const errorMessage = error.message;

      throw new ObjectMetadataException(
        errorMessage,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        {
          userFriendlyMessage: errorMessage,
        },
      );
    }

    throw error;
  }
};

export const validateObjectMetadataInputLabelsOrThrow = <
  T extends CreateObjectInput,
>({
  labelPlural,
  labelSingular,
}: T): void =>
  [labelPlural, labelSingular].forEach((label) =>
    validateObjectMetadataInputLabelOrThrow(label),
  );

const validateObjectMetadataInputLabelOrThrow = (name: string): void => {
  const validators = [
    validateMetadataNameIsNotTooShortOrThrow,
    validateMetadataNameIsNotTooLongOrThrow,
  ];

  try {
    validators.forEach((validator) => validator(name.trim()));
  } catch (error) {
    if (error instanceof InvalidMetadataException) {
      throw new ObjectMetadataException(
        error.message,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    }

    throw error;
  }
};

type ValidateLowerCasedAndTrimmedStringAreDifferentOrThrowArgs = {
  inputs: [string, string];
  message: string;
};
export const validateLowerCasedAndTrimmedStringsAreDifferentOrThrow = ({
  message,
  inputs: [firstString, secondString],
}: ValidateLowerCasedAndTrimmedStringAreDifferentOrThrowArgs) => {
  if (firstString.trim().toLowerCase() === secondString.trim().toLowerCase()) {
    throw new ObjectMetadataException(
      message,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
