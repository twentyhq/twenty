/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findWorkspaceMemberBoundPredicates } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-bound-predicates.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const isWorkspaceMemberUpdateAffectingAccessGroups = ({
  updatedFields,
  rolesPermissions,
  flatFieldMetadataMaps,
}: {
  updatedFields: string[];
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): boolean =>
  findWorkspaceMemberBoundPredicates(rolesPermissions).some(
    ({ workspaceMemberFieldMetadataId }) => {
      const name = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: workspaceMemberFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })?.name;

      return (
        isDefined(name) &&
        (updatedFields.includes(name) ||
          updatedFields.includes(
            computeMorphOrRelationFieldJoinColumnName({ name }),
          ))
      );
    },
  );
