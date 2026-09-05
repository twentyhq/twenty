import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSharingRuleMaps } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule-maps.type';
import { fromSharingRuleEntityToFlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/utils/from-sharing-rule-entity-to-flat-sharing-rule.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_SHARING_RULE_ROWS_REQUIREMENT = {
  sharingRule: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  rowLevelPermissionPredicate: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['sharingRuleId'],
  },
  rowLevelPermissionPredicateGroup: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['sharingRuleId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatSharingRuleMaps', { packingPonderation: 1 })
export class WorkspaceFlatSharingRuleMapCacheService extends MetadataFlatEntityMapsCacheProvider<'sharingRule'> {
  override readonly rowsRequirement = FLAT_SHARING_RULE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_SHARING_RULE_ROWS_REQUIREMENT
  >): FlatSharingRuleMaps {
    const {
      sharingRule: sharingRules,
      application: applications,
      objectMetadata: objectMetadatas,
      role: roles,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);

    const flatSharingRuleMaps = createEmptyFlatEntityMaps();

    for (const sharingRuleEntity of sharingRules) {
      const flatSharingRule = fromSharingRuleEntityToFlatSharingRule({
        entity: {
          ...sharingRuleEntity,
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicates.bySharingRuleId.get(
              sharingRuleEntity.id,
            ) || [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroups.bySharingRuleId.get(
              sharingRuleEntity.id,
            ) || [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSharingRule,
        flatEntityMapsToMutate: flatSharingRuleMaps,
      });
    }

    return flatSharingRuleMaps;
  }
}
