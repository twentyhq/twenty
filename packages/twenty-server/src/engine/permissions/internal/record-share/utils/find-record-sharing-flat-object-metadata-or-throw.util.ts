/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findRecordSharingFlatObjectMetadataOrThrow = ({
  objectMetadataId,
  flatObjectMetadataMaps,
}: {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatObjectMetadata => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new NotFoundError('Record not found');
  }

  return flatObjectMetadata;
};
