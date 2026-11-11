/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isObjectRestrictedByRlsRule } from 'src/engine/permissions/internal/access-group/utils/is-object-restricted-by-rls-rule.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

// A path only carries access when RLS restricts its source, so workspaces without rules compute nothing
export const findRelatedRecordPathsFeedingAccessGroups = ({
  rolesPermissions,
  flatObjectMetadataMaps,
  resolvedRelatedRecordPaths,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  objectMetadataId: string;
}): ResolvedRelatedRecordPath[] => {
  const findFeedingPaths = ({
    targetObjectMetadataId,
    visitedObjectMetadataIds,
  }: {
    targetObjectMetadataId: string;
    visitedObjectMetadataIds: Set<string>;
  }): ResolvedRelatedRecordPath[] =>
    resolvedRelatedRecordPaths.filter(
      (resolvedPath) =>
        resolvedPath.targetObjectMetadataId === targetObjectMetadataId &&
        isSourceUsingRecordAccessGroups({
          resolvedPath,
          visitedObjectMetadataIds: new Set([
            ...visitedObjectMetadataIds,
            targetObjectMetadataId,
          ]),
        }),
    );

  const isSourceUsingRecordAccessGroups = ({
    resolvedPath: { isInherent, sourceFlatObjectMetadata },
    visitedObjectMetadataIds,
  }: {
    resolvedPath: ResolvedRelatedRecordPath;
    visitedObjectMetadataIds: Set<string>;
  }): boolean => {
    if (
      isObjectRestrictedByRlsRule({
        rolesPermissions,
        flatObjectMetadataMaps,
        objectMetadataId: sourceFlatObjectMetadata.id,
      })
    ) {
      return true;
    }

    return (
      isInherent &&
      !isPermissionStorageObject(sourceFlatObjectMetadata) &&
      !visitedObjectMetadataIds.has(sourceFlatObjectMetadata.id) &&
      findFeedingPaths({
        targetObjectMetadataId: sourceFlatObjectMetadata.id,
        visitedObjectMetadataIds,
      }).length > 0
    );
  };

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (
    !isDefined(flatObjectMetadata) ||
    isPermissionStorageObject(flatObjectMetadata)
  ) {
    return [];
  }

  return findFeedingPaths({
    targetObjectMetadataId: objectMetadataId,
    visitedObjectMetadataIds: new Set(),
  });
};
