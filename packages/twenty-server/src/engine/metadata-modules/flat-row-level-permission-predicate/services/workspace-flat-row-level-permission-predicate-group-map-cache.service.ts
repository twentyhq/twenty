/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-group-entity-to-flat-row-level-permission-predicate-group.util';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ROWS_REQUIREMENT = {
  rowLevelPermissionPredicateGroup: {
    columns: true,
    groupBy: ['parentRowLevelPermissionPredicateGroupId'],
  },
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  rowLevelPermissionPredicate: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['rowLevelPermissionPredicateGroupId'],
  },
  sharingRule: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateGroupMaps', {
  packingPonderation: 1,
})
export class WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService extends MetadataFlatEntityMapsCacheProvider<'rowLevelPermissionPredicateGroup'> {
  override readonly rowsRequirement =
    FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ROWS_REQUIREMENT
  >): FlatRowLevelPermissionPredicateGroupMaps {
    const {
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
      application: applications,
      objectMetadata: objectMetadatas,
      role: roles,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      sharingRule: sharingRules,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const sharingRuleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(sharingRules);
    const rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(rowLevelPermissionPredicateGroups.rows);

    const flatRowLevelPermissionPredicateGroupMaps =
      createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateGroupEntity of rowLevelPermissionPredicateGroups.rows) {
      const flatRowLevelPermissionPredicateGroup =
        fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup(
          {
            entity: {
              ...rowLevelPermissionPredicateGroupEntity,
              childRowLevelPermissionPredicateGroups:
                rowLevelPermissionPredicateGroups.byParentRowLevelPermissionPredicateGroupId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
              rowLevelPermissionPredicates:
                rowLevelPermissionPredicates.byRowLevelPermissionPredicateGroupId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
            },
            applicationIdToUniversalIdentifierMap,
            objectMetadataIdToUniversalIdentifierMap,
            roleIdToUniversalIdentifierMap,
            rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
            sharingRuleIdToUniversalIdentifierMap,
          },
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicateGroup,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateGroupMaps,
      });
    }

    return flatRowLevelPermissionPredicateGroupMaps;
  }
}
