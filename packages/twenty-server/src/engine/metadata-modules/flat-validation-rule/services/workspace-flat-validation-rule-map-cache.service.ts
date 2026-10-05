import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';
import { fromValidationRuleEntityToFlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/utils/from-validation-rule-entity-to-flat-validation-rule.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VALIDATION_RULE_ROWS_REQUIREMENT = {
  validationRule: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatValidationRuleMaps', { packingPonderation: 1 })
export class WorkspaceFlatValidationRuleMapCacheService extends MetadataFlatEntityMapsCacheProvider<'validationRule'> {
  override readonly rowsRequirement = FLAT_VALIDATION_RULE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VALIDATION_RULE_ROWS_REQUIREMENT
  >): FlatValidationRuleMaps {
    const {
      validationRule: validationRules,
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

    const flatValidationRuleMaps = createEmptyFlatEntityMaps();

    for (const validationRuleEntity of validationRules) {
      const flatValidationRule = fromValidationRuleEntityToFlatValidationRule({
        entity: validationRuleEntity,
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatValidationRule,
        flatEntityMapsToMutate: flatValidationRuleMaps,
      });
    }

    return flatValidationRuleMaps;
  }
}
