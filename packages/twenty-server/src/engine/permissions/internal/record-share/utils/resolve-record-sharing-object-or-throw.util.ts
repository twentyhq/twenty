/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type ObjectSharing,
  resolveObjectSharing,
} from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';

export type RecordSharingObject = ObjectSharing & {
  flatObjectMetadata: FlatObjectMetadata;
};

export const resolveRecordSharingObjectOrThrow = ({
  objectMetadataId,
  flatObjectMetadataMaps,
  featureFlagsMap,
}: {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): RecordSharingObject => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new NotFoundError('Record not found');
  }

  return {
    flatObjectMetadata,
    ...resolveObjectSharing({ flatObjectMetadata, featureFlagsMap }),
  };
};
