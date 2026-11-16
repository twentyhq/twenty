import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { type UserWorkspaceSystemSideEffectRoleIdsMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-system-side-effect-role-ids-map.type';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('userWorkspaceSystemSideEffectRoleIdsMap')
export class WorkspaceUserWorkspaceSystemSideEffectRoleIdsMapCacheService extends WorkspaceDerivedCacheProvider<
  'userWorkspaceSystemSideEffectRoleIdsMap',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyName = 'flatRoleTargetMaps';

  protected computeFromSource(
    flatRoleTargetMaps: WorkspaceCacheDataMap['flatRoleTargetMaps'],
  ): UserWorkspaceSystemSideEffectRoleIdsMap {
    const userWorkspaceSystemSideEffectRoleIdsMap: UserWorkspaceSystemSideEffectRoleIdsMap =
      {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatRoleTarget?.userWorkspaceId) &&
        flatRoleTarget.isSystemSideEffect
      ) {
        userWorkspaceSystemSideEffectRoleIdsMap[
          flatRoleTarget.userWorkspaceId
        ] = [
          ...(userWorkspaceSystemSideEffectRoleIdsMap[
            flatRoleTarget.userWorkspaceId
          ] ?? []),
          flatRoleTarget.roleId,
        ];
      }
    }

    return userWorkspaceSystemSideEffectRoleIdsMap;
  }
}
