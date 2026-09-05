/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-entity-to-flat-row-level-permission-predicate.util';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_ROWS_REQUIREMENT = {
  rowLevelPermissionPredicate: true,
  application: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  rowLevelPermissionPredicateGroup: ['id', 'universalIdentifier'],
  sharingRule: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateMaps', {
  packingPonderation: 1,
})
export class WorkspaceFlatRowLevelPermissionPredicateMapCacheService extends MetadataFlatEntityMapsCacheProvider<'rowLevelPermissionPredicate'> {
  override readonly rowsRequirement =
    FLAT_ROW_LEVEL_PERMISSION_PREDICATE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_ROW_LEVEL_PERMISSION_PREDICATE_ROWS_REQUIREMENT
  >): FlatRowLevelPermissionPredicateMaps {
    const {
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      application: applications,
      fieldMetadata: fieldMetadatas,
      objectMetadata: objectMetadatas,
      role: roles,
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
      sharingRule: sharingRules,
    } = rows;

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
    const sharingRuleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(sharingRules);

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
          sharingRuleIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicate,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateMaps,
      });
    }

    return flatRowLevelPermissionPredicateMaps;
  }
}
