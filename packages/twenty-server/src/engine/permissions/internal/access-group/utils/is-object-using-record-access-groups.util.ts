/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { isObjectRestrictedByRlsRule } from 'src/engine/permissions/internal/access-group/utils/is-object-restricted-by-rls-rule.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const isObjectUsingRecordAccessGroups = (args: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  objectMetadataId: string;
}): boolean =>
  isObjectRestrictedByRlsRule(args) ||
  isNonEmptyArray(findRelatedRecordPathsFeedingAccessGroups(args));
