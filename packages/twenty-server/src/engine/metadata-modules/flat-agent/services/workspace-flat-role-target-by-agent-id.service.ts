import { Injectable } from '@nestjs/common';

import { NonNullableRequired } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

@Injectable()
@WorkspaceCache('flatRoleTargetByAgentIdMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatRoleTargetByAgentIdMaps> {
    const [roleTargets, applications, roles, agents] = await Promise.all([
      recomputeContext.findAll(RoleTargetEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(RoleEntity, ['id', 'universalIdentifier']),
      recomputeContext.findAll(AgentEntity, ['id', 'universalIdentifier']),
    ]);

    // the recompute context only filters on workspaceId: the previous
    // agentId IS NOT NULL condition moved in memory
    const roleTargetEntities = roleTargets.filter((roleTarget) =>
      isDefined(roleTarget.agentId),
    );

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const agentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(agents);

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const roleTargetEntity of roleTargetEntities as Array<
      Omit<RoleTargetEntity, 'agentId'> &
        NonNullableRequired<Pick<RoleTargetEntity, 'agentId'>>
    >) {
      const flatRoleTarget = fromRoleTargetEntityToFlatRoleTarget({
        entity: roleTargetEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
        agentIdToUniversalIdentifierMap,
      });

      flatRoleTargetByAgentIdMaps[roleTargetEntity.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
