import { Injectable } from '@nestjs/common';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { computeRoleIdsWithAllRecordsAccess } from 'src/engine/metadata-modules/role/utils/compute-role-ids-with-all-records-access.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('roleIdsWithAllRecordsAccess', {
  maxMemoizedWorkspaces: 1_000,
})
export class WorkspaceRoleIdsWithAllRecordsAccessCacheService extends WorkspaceDerivedCacheProvider<
  'roleIdsWithAllRecordsAccess',
  'flatRoleMaps'
> {
  readonly sourceKeyNames = ['flatRoleMaps'] as const;

  computeFromSources({
    flatRoleMaps,
  }: Pick<WorkspaceCacheDataMap, 'flatRoleMaps'>): string[] {
    return computeRoleIdsWithAllRecordsAccess({ flatRoleMaps });
  }
}
