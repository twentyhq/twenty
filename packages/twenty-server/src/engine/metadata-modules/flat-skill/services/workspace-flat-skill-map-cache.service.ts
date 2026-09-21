import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSkillMaps } from 'src/engine/metadata-modules/flat-skill/types/flat-skill-maps.type';
import { fromSkillEntityToFlatSkill } from 'src/engine/metadata-modules/flat-skill/utils/from-skill-entity-to-flat-skill.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_SKILL_ROWS_REQUIREMENT = {
  skill: true,
  application: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatSkillMaps', { packingPonderation: 2 })
export class WorkspaceFlatSkillMapCacheService extends MetadataFlatEntityMapsCacheProvider<'skill'> {
  override readonly rowsRequirement = FLAT_SKILL_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_SKILL_ROWS_REQUIREMENT
  >): FlatSkillMaps {
    const { skill: skills, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatSkillMaps = createEmptyFlatEntityMaps();

    for (const skillEntity of skills) {
      const flatSkill = fromSkillEntityToFlatSkill({
        entity: skillEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSkill,
        flatEntityMapsToMutate: flatSkillMaps,
      });
    }

    return flatSkillMaps;
  }
}
