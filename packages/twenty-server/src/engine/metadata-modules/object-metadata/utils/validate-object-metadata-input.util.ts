import { BadRequestException } from '@nestjs/common';

import { InvalidStringException } from 'src/engine/metadata-modules/errors/InvalidStringException';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { validateString } from 'src/engine/metadata-modules/utils/validate-string.utils';

export const validateObjectMetadataInput = <
  T extends UpdateObjectInput | CreateObjectInput,
>(
  objectMetadataInput: T,
): void => {
  try {
    if (objectMetadataInput.nameSingular) {
      validateString(objectMetadataInput.nameSingular);
    }

    if (objectMetadataInput.namePlural) {
      validateString(objectMetadataInput.namePlural);
    }
  } catch (error) {
    if (error instanceof InvalidStringException) {
      console.error(error.message);
      throw new BadRequestException(
        `Characters used in name "${objectMetadataInput.nameSingular}" or "${objectMetadataInput.namePlural}" are not supported`,
      );
    } else {
      throw error;
    }
  }
};
