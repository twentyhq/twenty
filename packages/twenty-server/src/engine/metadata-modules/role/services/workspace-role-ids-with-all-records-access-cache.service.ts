import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const ROLE_IDS_WITH_ALL_RECORDS_ACCESS_ROWS_REQUIREMENT = {
  role: ['id', 'canUpdateAllSettings'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('roleIdsWithAllRecordsAccess', { packingPonderation: 1 })
export class WorkspaceRoleIdsWithAllRecordsAccessCacheService extends WorkspaceCacheProvider<
  string[]
> {
  override readonly rowsRequirement =
    ROLE_IDS_WITH_ALL_RECORDS_ACCESS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ROLE_IDS_WITH_ALL_RECORDS_ACCESS_ROWS_REQUIREMENT
  >): string[] {
    return rows.role
      .filter((role) => role.canUpdateAllSettings)
      .map((role) => role.id);
  }
}
