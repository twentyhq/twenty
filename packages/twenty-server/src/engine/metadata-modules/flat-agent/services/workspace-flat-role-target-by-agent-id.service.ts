import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NonNullableRequired } from 'twenty-shared/types';
import { IsNull, Not, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { fromRoleTargetsEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('flatRoleTargetByAgentIdMaps')
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRoleTargetByAgentIdMaps> {
    const roleTargetEntities = await this.roleTargetRepository.find({
      where: {
        workspaceId,
        agentId: Not(IsNull()),
      },
      withDeleted: true,
    });

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const roleTargetEntity of roleTargetEntities as Array<
      Omit<RoleTargetEntity, 'agentId'> &
        NonNullableRequired<Pick<RoleTargetEntity, 'agentId'>>
    >) {
      const flatRoleTarget =
        fromRoleTargetsEntityToFlatRoleTarget(roleTargetEntity);

      flatRoleTargetByAgentIdMaps[roleTargetEntity.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
