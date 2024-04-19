import { BadRequestException } from '@nestjs/common';

import { ChararactersNotSupportedException } from 'src/engine/metadata-modules/errors/CharactersNotSupportedException';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { UpdateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { formatString } from 'src/engine/metadata-modules/utils/format-string.util';

export const formatObjectMetadataInput = <
  T extends UpdateObjectInput | CreateObjectInput,
>(
  objectMetadataInput: T,
): T => {
  try {
    return (objectMetadataInput = {
      ...objectMetadataInput,
      nameSingular: objectMetadataInput.nameSingular
        ? formatString(objectMetadataInput.nameSingular)
        : objectMetadataInput.nameSingular,
      namePlural: objectMetadataInput.namePlural
        ? formatString(objectMetadataInput.namePlural)
        : objectMetadataInput.namePlural,
    });
  } catch (error) {
    if (error instanceof ChararactersNotSupportedException) {
      console.error(error.message);
      throw new BadRequestException(
        `Characters used in name "${objectMetadataInput.nameSingular}" or "${objectMetadataInput.namePlural}" are not supported`,
      );
    } else {
      throw error;
    }
  }
};
