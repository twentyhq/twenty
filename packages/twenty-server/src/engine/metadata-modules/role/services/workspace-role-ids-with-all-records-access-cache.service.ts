import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('roleIdsWithAllRecordsAccess')
export class WorkspaceRoleIdsWithAllRecordsAccessCacheService extends WorkspaceDerivedCacheProvider<
  'roleIdsWithAllRecordsAccess',
  'flatRoleMaps'
> {
  readonly sourceKeyName = 'flatRoleMaps';

  protected computeFromSource(
    flatRoleMaps: WorkspaceCacheDataMap['flatRoleMaps'],
  ): string[] {
    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatRole) => flatRole.canUpdateAllSettings)
      .map((flatRole) => flatRole.id);
  }
}
