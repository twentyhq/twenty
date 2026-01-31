import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NonNullableRequired } from 'twenty-shared/types';
import { IsNull, Not, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

@Injectable()
@WorkspaceCache('flatRoleTargetByAgentIdMaps')
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRoleTargetByAgentIdMaps> {
    const [roleTargetEntities, applications, roles] = await Promise.all([
      this.roleTargetRepository.find({
        where: {
          workspaceId,
          agentId: Not(IsNull()),
        },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.roleRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const roleTargetEntity of roleTargetEntities as Array<
      Omit<RoleTargetEntity, 'agentId'> &
        NonNullableRequired<Pick<RoleTargetEntity, 'agentId'>>
    >) {
      const flatRoleTarget = fromRoleTargetEntityToFlatRoleTarget({
        entity: roleTargetEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
      });

      flatRoleTargetByAgentIdMaps[roleTargetEntity.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
