/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-group-entity-to-flat-row-level-permission-predicate-group.util';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateGroupMaps', {
  packingPonderation: 1,
})
export class WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateGroupMaps> {
  override readonly fetchRequirements = {
    rowLevelPermissionPredicateGroup: true,
    application: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
    role: ['id', 'universalIdentifier'],
    rowLevelPermissionPredicate: [
      'id',
      'universalIdentifier',
      'rowLevelPermissionPredicateGroupId',
    ],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRowLevelPermissionPredicateGroupMaps {
    const {
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
      application: applications,
      objectMetadata: objectMetadatas,
      role: roles,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [
      childRowLevelPermissionPredicateGroupsByParentId,
      rowLevelPermissionPredicatesByGroupId,
    ] = (
      [
        {
          entities: rowLevelPermissionPredicateGroups,
          foreignKey: 'parentRowLevelPermissionPredicateGroupId',
        },
        {
          entities: rowLevelPermissionPredicates,
          foreignKey: 'rowLevelPermissionPredicateGroupId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(rowLevelPermissionPredicateGroups);

    const flatRowLevelPermissionPredicateGroupMaps =
      createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateGroupEntity of rowLevelPermissionPredicateGroups) {
      const flatRowLevelPermissionPredicateGroup =
        fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup(
          {
            entity: {
              ...rowLevelPermissionPredicateGroupEntity,
              childRowLevelPermissionPredicateGroups:
                childRowLevelPermissionPredicateGroupsByParentId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
              rowLevelPermissionPredicates:
                rowLevelPermissionPredicatesByGroupId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
            },
            applicationIdToUniversalIdentifierMap,
            objectMetadataIdToUniversalIdentifierMap,
            roleIdToUniversalIdentifierMap,
            rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
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
