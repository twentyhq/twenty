/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { isObjectRestrictedByRlsRule } from 'src/engine/permissions/internal/rls/utils/is-object-restricted-by-rls-rule.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const isObjectUsingRecordAccessGroups = ({
  rolesPermissions,
  flatObjectMetadataMaps,
  resolvedRelatedRecordPaths,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  objectMetadataId: string;
}): boolean => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  return (
    isDefined(flatObjectMetadata) &&
    !temporaryExcludePermissionStorageObject(flatObjectMetadata) &&
    (isObjectRestrictedByRlsRule({ rolesPermissions, objectMetadataId }) ||
      isNonEmptyArray(
        findRelatedRecordPathsFeedingAccessGroups({
          rolesPermissions,
          resolvedRelatedRecordPaths,
          objectMetadataId,
        }),
      ))
  );
};
