import { Injectable } from '@nestjs/common';

import { NonNullableRequired } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('flatApplicationMaps')
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRoleTargetByAgentIdMaps> {
    const { flatRoleTargetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    const agentRelatedRoleTargets = Object.values(
      flatRoleTargetMaps.byId,
    ).filter(
      (
        flatRoleTarget,
      ): flatRoleTarget is Omit<FlatRoleTarget, 'agentId'> &
        NonNullableRequired<Pick<FlatRoleTarget, 'agentId'>> =>
        isDefined(flatRoleTarget) && isDefined(flatRoleTarget.agentId),
    );

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const flatRoleTarget of agentRelatedRoleTargets) {
      flatRoleTargetByAgentIdMaps[flatRoleTarget.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
