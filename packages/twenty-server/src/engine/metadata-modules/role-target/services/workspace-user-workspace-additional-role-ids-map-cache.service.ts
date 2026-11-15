import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { type UserWorkspaceAdditionalRoleIdsMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-additional-role-ids-map.type';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('userWorkspaceAdditionalRoleIdsMap')
export class WorkspaceUserWorkspaceAdditionalRoleIdsMapCacheService extends WorkspaceDerivedCacheProvider<
  'userWorkspaceAdditionalRoleIdsMap',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyName = 'flatRoleTargetMaps';

  protected computeFromSource(
    flatRoleTargetMaps: WorkspaceCacheDataMap['flatRoleTargetMaps'],
  ): UserWorkspaceAdditionalRoleIdsMap {
    const userWorkspaceAdditionalRoleIdsMap: UserWorkspaceAdditionalRoleIdsMap =
      {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatRoleTarget?.userWorkspaceId) &&
        flatRoleTarget.isAdditional
      ) {
        userWorkspaceAdditionalRoleIdsMap[flatRoleTarget.userWorkspaceId] = [
          ...(userWorkspaceAdditionalRoleIdsMap[
            flatRoleTarget.userWorkspaceId
          ] ?? []),
          flatRoleTarget.roleId,
        ];
      }
    }

    return userWorkspaceAdditionalRoleIdsMap;
  }
}
