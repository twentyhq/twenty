/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRecordInheritanceRuleMaps } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule-maps.type';
import { fromRecordInheritanceRuleEntityToFlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/utils/from-record-inheritance-rule-entity-to-flat-record-inheritance-rule.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_RECORD_INHERITANCE_RULE_ROWS_REQUIREMENT = {
  recordInheritanceRule: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRecordInheritanceRuleMaps', { packingPonderation: 1 })
export class WorkspaceFlatRecordInheritanceRuleMapCacheService extends MetadataFlatEntityMapsCacheProvider<'recordInheritanceRule'> {
  override readonly rowsRequirement =
    FLAT_RECORD_INHERITANCE_RULE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_RECORD_INHERITANCE_RULE_ROWS_REQUIREMENT
  >): FlatRecordInheritanceRuleMaps {
    const {
      recordInheritanceRule: recordInheritanceRules,
      application: applications,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatRecordInheritanceRuleMaps = createEmptyFlatEntityMaps();

    for (const recordInheritanceRuleEntity of recordInheritanceRules) {
      const flatRecordInheritanceRule =
        fromRecordInheritanceRuleEntityToFlatRecordInheritanceRule({
          entity: recordInheritanceRuleEntity,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRecordInheritanceRule,
        flatEntityMapsToMutate: flatRecordInheritanceRuleMaps,
      });
    }

    return flatRecordInheritanceRuleMaps;
  }
}
