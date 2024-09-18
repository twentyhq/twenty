import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const assertMutationNotOnRemoteObject = (
  objectMetadataItem: Pick<ObjectMetadataInterface, 'isRemote'>,
) => {
  if (objectMetadataItem.isRemote) {
    throw new ObjectMetadataException(
      'Remote objects are read-only',
      ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
    );
  }
};
