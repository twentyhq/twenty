import { slugify } from 'transliteration';
import { isDefined } from 'twenty-shared';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import {
  beneathDatabaseIdentifierMininumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { validateMetadataNameValidityOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-validity.utils';
import { camelCase } from 'src/utils/camel-case';

const coreObjectNames = [
  'approvedAccessDomain',
  'approvedAccessDomains',
  'appToken',
  'appTokens',
  'billingCustomer',
  'billingCustomers',
  'billingEntitlement',
  'billingEntitlements',
  'billingMeter',
  'billingMeters',
  'billingProduct',
  'billingProducts',
  'billingSubscription',
  'billingSubscriptions',
  'billingSubscriptionItem',
  'billingSubscriptionItems',
  'featureFlag',
  'featureFlags',
  'keyValuePair',
  'keyValuePairs',
  'postgresCredential',
  'postgresCredentials',
  'twoFactorMethod',
  'twoFactorMethods',
  'user',
  'users',
  'userWorkspace',
  'userWorkspaces',
  'workspace',
  'workspaces',

  'role',
  'roles',
  'userWorkspaceRole',
  'userWorkspaceRoles',
];

const reservedKeywords = [
  ...coreObjectNames,
  'event',
  'events',
  'field',
  'fields',
  'link',
  'links',
  'currency',
  'currencies',
  'fullName',
  'fullNames',
  'address',
  'addresses',
  'type',
  'types',
  'object',
  'objects',
  'index',
  'relation',
  'relations',
];

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
  const validators = [
    validateStringIsNoTooShortOrThrow,
    validateStringIsNotTooLongOrThrow,
    validateNameCamelCasedOrThrow,
    validateNameCharactersOrThrow,
    validateNameIsNotReservedKeywordOrThrow,
  ];

  validators.forEach((validator) => validator(name));
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
    validateStringIsNoTooShortOrThrow,
    validateStringIsNotTooLongOrThrow,
  ];

  validators.forEach((validator) => validator(name.trim()));
};

const validateNameIsNotReservedKeywordOrThrow = (name: string) => {
  if (reservedKeywords.includes(name)) {
    throw new ObjectMetadataException(
      `The name "${name}" is not available`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateNameCamelCasedOrThrow = (name: string) => {
  if (name !== camelCase(name)) {
    throw new ObjectMetadataException(
      `Name should be in camelCase: ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateStringIsNotTooLongOrThrow = (name: string) => {
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new ObjectMetadataException(
      `Input exceeds ${IDENTIFIER_MAX_CHAR_LENGTH} characters: ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateStringIsNoTooShortOrThrow = (name: string) => {
  if (beneathDatabaseIdentifierMininumLength(name)) {
    throw new ObjectMetadataException(
      `Input is too short: ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateNameCharactersOrThrow = (name: string) => {
  try {
    validateMetadataNameValidityOrThrow(name);
  } catch (error) {
    if (error instanceof InvalidStringException) {
      throw new ObjectMetadataException(
        `Characters used in name "${name}" are not supported`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    } else {
      throw error;
    }
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
  if (
    firstString.trim().toLowerCase() === secondString.trim().toLocaleLowerCase()
  ) {
    throw new ObjectMetadataException(
      message,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
