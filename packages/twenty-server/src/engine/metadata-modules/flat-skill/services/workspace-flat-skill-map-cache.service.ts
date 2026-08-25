import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSkillMaps } from 'src/engine/metadata-modules/flat-skill/types/flat-skill-maps.type';
import { fromSkillEntityToFlatSkill } from 'src/engine/metadata-modules/flat-skill/utils/from-skill-entity-to-flat-skill.util';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatSkillMaps', { packingPonderation: 2 })
export class WorkspaceFlatSkillMapCacheService extends WorkspaceCacheProvider<FlatSkillMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(SkillEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatSkillMaps {
    const skills = recomputeContext.getRows(SkillEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);

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
