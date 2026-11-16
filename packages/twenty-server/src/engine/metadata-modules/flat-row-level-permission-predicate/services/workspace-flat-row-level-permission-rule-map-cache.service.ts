/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionRuleEntityToFlatRowLevelPermissionRule } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-rule-entity-to-flat-row-level-permission-rule.util';
import { type FlatRowLevelPermissionRuleMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_ROW_LEVEL_PERMISSION_RULE_ROWS_REQUIREMENT = {
  rowLevelPermissionRule: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRowLevelPermissionRuleMaps', { packingPonderation: 1 })
export class WorkspaceFlatRowLevelPermissionRuleMapCacheService extends MetadataFlatEntityMapsCacheProvider<'rowLevelPermissionRule'> {
  override readonly rowsRequirement =
    FLAT_ROW_LEVEL_PERMISSION_RULE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_ROW_LEVEL_PERMISSION_RULE_ROWS_REQUIREMENT
  >): FlatRowLevelPermissionRuleMaps {
    const {
      rowLevelPermissionRule: rowLevelPermissionRules,
      application: applications,
      objectMetadata: objectMetadatas,
      role: roles,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);

    const flatRowLevelPermissionRuleMaps = createEmptyFlatEntityMaps();

    for (const rowLevelPermissionRuleEntity of rowLevelPermissionRules) {
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity:
          fromRowLevelPermissionRuleEntityToFlatRowLevelPermissionRule({
            entity: rowLevelPermissionRuleEntity,
            applicationIdToUniversalIdentifierMap,
            objectMetadataIdToUniversalIdentifierMap,
            roleIdToUniversalIdentifierMap,
          }),
        flatEntityMapsToMutate: flatRowLevelPermissionRuleMaps,
      });
    }

    return flatRowLevelPermissionRuleMaps;
  }
}
