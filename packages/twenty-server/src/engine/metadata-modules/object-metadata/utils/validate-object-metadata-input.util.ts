import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { InvalidStringException } from 'src/engine/metadata-modules/errors/InvalidStringException';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { validateMetadataName } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

const coreObjectNames = [
  'appToken',
  'billingSubscription',
  'billingSubscriptions',
  'billingSubscriptionItem',
  'billingSubscriptionItems',
  'featureFlag',
  'user',
  'users',
  'userWorkspace',
  'userWorkspaces',
  'workspace',
  'workspaces',
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
];

export const validateObjectMetadataInput = <
  T extends UpdateObjectPayload | CreateObjectInput,
>(
  objectMetadataInput: T,
): void => {
  validateNameCharacters(objectMetadataInput.nameSingular);
  validateNameCharacters(objectMetadataInput.namePlural);

  validateNameIsNotReservedKeyword(objectMetadataInput.nameSingular);
  validateNameIsNotReservedKeyword(objectMetadataInput.namePlural);
};

const validateNameIsNotReservedKeyword = (name?: string) => {
  if (name) {
    if (reservedKeywords.includes(name)) {
      throw new ForbiddenException(
        `You cannot create an object with the name "${name}"`,
      );
    }
  }
};

const validateNameCharacters = (name?: string) => {
  try {
    if (name) {
      validateMetadataName(name);
    }
  } catch (error) {
    if (error instanceof InvalidStringException) {
      throw new BadRequestException(
        `Characters used in name "${name}" are not supported`,
      );
    } else {
      throw error;
    }
  }
};
