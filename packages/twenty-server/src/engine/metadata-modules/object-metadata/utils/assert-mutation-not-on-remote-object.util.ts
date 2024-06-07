import { BadRequestException } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const assertMutationNotOnRemoteObject = (
  objectMetadataItem: ObjectMetadataInterface,
) => {
  if (objectMetadataItem.isRemote) {
    throw new BadRequestException('Remote objects are read-only');
  }
};
