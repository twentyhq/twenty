import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSkillMaps } from 'src/engine/metadata-modules/flat-skill/types/flat-skill-maps.type';
import { fromSkillEntityToFlatSkill } from 'src/engine/metadata-modules/flat-skill/utils/from-skill-entity-to-flat-skill.util';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatSkillMaps')
export class WorkspaceFlatSkillMapCacheService extends WorkspaceCacheProvider<FlatSkillMaps> {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatSkillMaps> {
    const skills = await this.skillRepository.find({
      where: { workspaceId },
      withDeleted: true,
    });

    const flatSkillMaps = createEmptyFlatEntityMaps();

    for (const skillEntity of skills) {
      const flatSkill = fromSkillEntityToFlatSkill(skillEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSkill,
        flatEntityMapsToMutate: flatSkillMaps,
      });
    }

    return flatSkillMaps;
  }
}
