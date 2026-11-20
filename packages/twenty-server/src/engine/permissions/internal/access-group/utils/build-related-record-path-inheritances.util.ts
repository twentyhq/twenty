/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findRoleIdsUnableToReadField } from 'src/engine/permissions/internal/access-group/utils/find-role-ids-unable-to-read-field.util';
import { isPrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/is-private-records-enabled.util';
import { type RelatedRecordPathInheritance } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-inheritance.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export const buildRelatedRecordPathInheritances = ({
  resolvedRelatedRecordPaths,
  accessGroups,
  metadataMaps,
}: {
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  accessGroups: AccessGroup[];
  metadataMaps: Pick<
    RecordAccessGroupComputationMetadataMaps,
    'rolesPermissions' | 'featureFlagsMap'
  >;
}): RelatedRecordPathInheritance[] =>
  resolvedRelatedRecordPaths.map(
    ({ hops, isInherent, sourceFlatObjectMetadata }) => ({
      hops,
      sourceObjectCompactIds: isInherent
        ? null
        : accessGroups
            .filter(
              (accessGroup) =>
                accessGroup.objectMetadataId === sourceFlatObjectMetadata.id,
            )
            .map(({ compactId }) => compactId),
      roleIdsUnableToReadRelation: findRoleIdsUnableToReadField({
        rolesPermissions: metadataMaps.rolesPermissions,
        objectMetadataId: sourceFlatObjectMetadata.id,
        fieldMetadataId: hops[0].relationFieldMetadataId,
      }),
      isSourcePrivacyApplicable: isPrivateRecordsEnabled({
        flatObjectMetadata: sourceFlatObjectMetadata,
        featureFlagsMap: metadataMaps.featureFlagsMap,
      }),
    }),
  );
