/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-entity-to-flat-row-level-permission-predicate.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateMaps', {
  packingPonderation: 1,
})
export class WorkspaceFlatRowLevelPermissionPredicateMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RowLevelPermissionPredicateEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(FieldMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RowLevelPermissionPredicateGroupEntity, [
      'id',
      'universalIdentifier',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRowLevelPermissionPredicateMaps {
    const rowLevelPermissionPredicates = recomputeContext.getRows(
      RowLevelPermissionPredicateEntity,
    );
    const applications = recomputeContext.getRows(ApplicationEntity);
    const fieldMetadatas = recomputeContext.getRows(FieldMetadataEntity);
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const rowLevelPermissionPredicateGroups = recomputeContext.getRows(
      RowLevelPermissionPredicateGroupEntity,
    );

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(rowLevelPermissionPredicateGroups);

    const flatRowLevelPermissionPredicateMaps = createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateEntity of rowLevelPermissionPredicates) {
      const flatRowLevelPermissionPredicate =
        fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate({
          entity: rowLevelPermissionPredicateEntity,
          applicationIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicate,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateMaps,
      });
    }

    return flatRowLevelPermissionPredicateMaps;
  }
}
