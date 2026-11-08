/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const findCandidateObjectMetadataIds = ({
  shouldRecomputeEveryRecord,
  flatObjectMetadataMaps,
  changedAccessGroups,
}: {
  shouldRecomputeEveryRecord: boolean;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
  changedAccessGroups: Pick<AccessGroup, 'objectMetadataId'>[];
}): string[] => {
  if (!shouldRecomputeEveryRecord) {
    return changedAccessGroups.map(({ objectMetadataId }) => objectMetadataId);
  }

  return Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .map(({ id }) => id);
};

export const findObjectMetadataIdsToRecompute = ({
  shouldRecomputeEveryRecord,
  flatObjectMetadataMaps,
  rolesPermissions,
  changedAccessGroups,
}: {
  shouldRecomputeEveryRecord: boolean;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  changedAccessGroups: Pick<AccessGroup, 'objectMetadataId'>[];
}): Set<string> =>
  new Set(
    findCandidateObjectMetadataIds({
      shouldRecomputeEveryRecord,
      flatObjectMetadataMaps,
      changedAccessGroups,
    }).filter((objectMetadataId) =>
      isObjectUsingRecordAccessGroups({ rolesPermissions, objectMetadataId }),
    ),
  );
