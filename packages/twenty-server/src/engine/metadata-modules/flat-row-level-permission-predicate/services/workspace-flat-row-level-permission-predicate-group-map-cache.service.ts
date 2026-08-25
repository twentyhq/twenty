/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-group-entity-to-flat-row-level-permission-predicate-group.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateGroupMaps', {
  packingPonderation: 1,
})
export class WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateGroupMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RowLevelPermissionPredicateGroupEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RowLevelPermissionPredicateEntity, [
      'id',
      'universalIdentifier',
      'rowLevelPermissionPredicateGroupId',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRowLevelPermissionPredicateGroupMaps {
    const rowLevelPermissionPredicateGroups = recomputeContext.getRows(
      RowLevelPermissionPredicateGroupEntity,
    );
    const applications = recomputeContext.getRows(ApplicationEntity);
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const rowLevelPermissionPredicates = recomputeContext.getRows(
      RowLevelPermissionPredicateEntity,
    );

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
