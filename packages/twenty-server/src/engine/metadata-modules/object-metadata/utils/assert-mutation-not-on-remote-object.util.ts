import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const assertMutationNotOnRemoteObject = (
  objectMetadataItem: ObjectMetadataInterface,
) => {
  if (objectMetadataItem.isRemote) {
    throw new Error('Remote objects are read-only');
  }
};
