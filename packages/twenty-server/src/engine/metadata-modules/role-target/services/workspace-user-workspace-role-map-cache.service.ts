import { Injectable } from '@nestjs/common';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { computeUserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/utils/compute-user-workspace-role-map.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('userWorkspaceRoleMap', {
  maxMemoizedWorkspaces: 1_000,
})
export class WorkspaceUserWorkspaceRoleMapCacheService extends WorkspaceDerivedCacheProvider<
  'userWorkspaceRoleMap',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyNames = ['flatRoleTargetMaps'] as const;

  computeFromSources({
    flatRoleTargetMaps,
  }: Pick<WorkspaceCacheDataMap, 'flatRoleTargetMaps'>): UserWorkspaceRoleMap {
    return computeUserWorkspaceRoleMap({ flatRoleTargetMaps });
  }
}
