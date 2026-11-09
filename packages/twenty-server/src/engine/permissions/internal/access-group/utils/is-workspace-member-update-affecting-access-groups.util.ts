/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export const isWorkspaceMemberUpdateAffectingAccessGroups = ({
  updatedFields,
  flatRowLevelPermissionPredicateMaps,
  flatFieldMetadataMaps,
}: {
  updatedFields: string[];
  flatRowLevelPermissionPredicateMaps: Pick<
    FlatRowLevelPermissionPredicateMaps,
    'byUniversalIdentifier'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): boolean =>
  Object.values(flatRowLevelPermissionPredicateMaps.byUniversalIdentifier)
    .filter(isDefined)
    .some(({ workspaceMemberFieldMetadataId, deletedAt }) => {
      if (isDefined(deletedAt) || !isDefined(workspaceMemberFieldMetadataId)) {
        return false;
      }

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
    });
