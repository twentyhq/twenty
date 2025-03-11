import { slugify } from 'transliteration';
import { isDefined } from 'twenty-shared';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';
import { validateMetadataNameIsNotTooLongOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-long.utils';
import { validateMetadataNameIsNotTooShortOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-short.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { camelCase } from 'src/utils/camel-case';

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
    if (error instanceof InvalidMetadataNameException) {
      throw new ObjectMetadataException(
        error.message,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
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
    if (error instanceof InvalidMetadataNameException) {
      throw new ObjectMetadataException(
        error.message,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

    throw error;
  }
};

export const computeMetadataNameFromLabel = (label: string): string => {
  if (!isDefined(label)) {
    throw new ObjectMetadataException(
      'Label is required',
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  const prefixedLabel = /^\d/.test(label) ? `n${label}` : label;

  if (prefixedLabel === '') {
    return '';
  }

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9',
  });

  if (formattedString === '') {
    throw new ObjectMetadataException(
      `Invalid label: "${label}"`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  return camelCase(formattedString);
};

export const validateNameAndLabelAreSyncOrThrow = (
  label: string,
  name: string,
) => {
  const computedName = computeMetadataNameFromLabel(label);

  if (name !== computedName) {
    throw new ObjectMetadataException(
      `Name is not synced with label. Expected name: "${computedName}", got ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
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
