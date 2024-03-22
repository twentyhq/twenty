import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { computeCustomName } from './compute-custom-name.util';

export const computeObjectTargetTable = (
  objectMetadata: ObjectMetadataInterface,
) => {
  return computeCustomName(
    objectMetadata.nameSingular,
    objectMetadata.isCustom,
  );
};
