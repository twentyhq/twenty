import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const assertMutationNotOnRemoteObject = (
  objectMetadataItem: Pick<ObjectMetadataEntity, 'isRemote'>,
) => {
  if (objectMetadataItem.isRemote) {
    throw new ObjectMetadataException(
      'Remote objects are read-only',
      ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
    );
  }
};
