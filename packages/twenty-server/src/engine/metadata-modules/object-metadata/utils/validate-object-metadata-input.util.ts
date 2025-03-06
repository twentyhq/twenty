import { slugify } from 'transliteration';

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
import { isDefined } from 'twenty-shared';

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

// TODO Unless does not verify that nameSingular and namePlural are different
// BETTER should not stop on first ?
export const validateObjectMetadataInputOrThrow = <
  T extends UpdateObjectPayload | CreateObjectInput,
>({
  namePlural,
  nameSingular,
}: T): void => {
  const validators = [
    validateNameIsNoTooShortOrThrow,
    validateNameCamelCasedOrThrow,
    validateNameCharactersOrThrow,
    validateNameIsNotReservedKeywordOrThrow,
    validateNameIsNotTooLongOrThrow,
  ];
  const names = [namePlural, nameSingular];
  names.forEach((name) => validators.forEach((validator) => validator(name)));
};

const validateNameIsNotReservedKeywordOrThrow = (name?: string) => {
  if (isDefined(name)) {
    if (reservedKeywords.includes(name)) {
      throw new ObjectMetadataException(
        `The name "${name}" is not available`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }
  }
};

const validateNameCamelCasedOrThrow = (name?: string) => {
  if (isDefined(name) && name !== camelCase(name)) {
    throw new ObjectMetadataException(
      `Name should be in camelCase: ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateNameIsNotTooLongOrThrow = (name?: string) => {
  if (isDefined(name) && exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new ObjectMetadataException(
      `Name exceeds ${IDENTIFIER_MAX_CHAR_LENGTH} characters: ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateNameIsNoTooShortOrThrow = (name?: string) => {
  if (isDefined(name) && beneathDatabaseIdentifierMininumLength(name)) {
    throw new ObjectMetadataException(
      `Name is too short`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};

const validateNameCharactersOrThrow = (name?: string) => {
  try {
    if (isDefined(name)) {
      validateMetadataNameValidityOrThrow(name);
    }
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

export const validateNameSingularAndNamePluralAreDifferentOrThrow = (
  nameSingular: string,
  namePlural: string,
) => {
  // Not case sensitive // Does not trim either
  if (nameSingular === namePlural) {
    throw new ObjectMetadataException(
      'The singular and plural name cannot be the same for an object',
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
