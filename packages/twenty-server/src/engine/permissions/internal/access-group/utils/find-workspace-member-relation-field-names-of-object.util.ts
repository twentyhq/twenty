/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findWorkspaceMemberRelationPredicates } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-relation-predicates.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findWorkspaceMemberRelationFieldNamesOfObject = ({
  rolesPermissions,
  flatFieldMetadataMaps,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectMetadataId: string;
}): string[] => {
  const findField = (fieldMetadataId: string | null | undefined) =>
    isDefined(fieldMetadataId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

  return findWorkspaceMemberRelationPredicates(rolesPermissions).flatMap(
    (predicate) => {
      const relationFieldMetadata = findField(
        predicate.workspaceMemberRelationFieldMetadataId,
      );

      if (
        relationFieldMetadata?.relationTargetObjectMetadataId !==
        objectMetadataId
      ) {
        return [];
      }

      return [
        findField(relationFieldMetadata.relationTargetFieldMetadataId),
        findField(predicate.workspaceMemberFieldMetadataId),
      ]
        .filter(isDefined)
        .flatMap(({ name }) => [
          name,
          computeMorphOrRelationFieldJoinColumnName({ name }),
        ]);
    },
  );
};
