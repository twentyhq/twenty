import { Injectable } from '@nestjs/common';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const ROLE_IDS_WITH_ALL_RECORDS_ACCESS_ROWS_REQUIREMENT = {
  role: ['id', 'canUpdateAllSettings'],
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
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
    const {
      role: roles,
      rolePermissionFlag: rolePermissionFlags,
      permissionFlag: permissionFlags,
    } = rows;

    const allRecordsPermissionFlagIds = new Set(
      permissionFlags
        .filter(
          (permissionFlag) =>
            permissionFlag.universalIdentifier ===
            SystemPermissionFlag[PermissionFlagType.ACCESS_ALL_RECORDS],
        )
        .map((permissionFlag) => permissionFlag.id),
    );

    return roles
      .filter(
        (role) =>
          role.canUpdateAllSettings ||
          (rolePermissionFlags.byRoleId.get(role.id) ?? []).some(
            (rolePermissionFlag) =>
              allRecordsPermissionFlagIds.has(
                rolePermissionFlag.permissionFlagId,
              ) ||
              rolePermissionFlag.flag === PermissionFlagType.ACCESS_ALL_RECORDS,
          ),
      )
      .map((role) => role.id);
  }
}
