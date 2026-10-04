import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('flatRoleTargetByAgentIdMaps', {
  maxMemoizedWorkspaces: 1_000,
})
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceDerivedCacheProvider<
  'flatRoleTargetByAgentIdMaps',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyNames = ['flatRoleTargetMaps'] as const;

  computeFromSources({
    flatRoleTargetMaps,
  }: Pick<
    WorkspaceCacheDataMap,
    'flatRoleTargetMaps'
  >): FlatRoleTargetByAgentIdMaps {
    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (isDefined(flatRoleTarget?.agentId)) {
        flatRoleTargetByAgentIdMaps[flatRoleTarget.agentId] = flatRoleTarget;
      }
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
