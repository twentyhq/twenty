import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { fromRoleTargetsEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleTargetMaps')
export class WorkspaceFlatRoleTargetMapCacheService extends WorkspaceCacheProvider<FlatRoleTargetMaps> {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatRoleTargetMaps> {
    const roleTargets = await this.roleTargetRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatRoleTargetMaps = createEmptyFlatEntityMaps();

    for (const roleTargetEntity of roleTargets) {
      const flatRoleTarget =
        fromRoleTargetsEntityToFlatRoleTarget(roleTargetEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRoleTarget,
        flatEntityMapsToMutate: flatRoleTargetMaps,
      });
    }

    return flatRoleTargetMaps;
  }
}
