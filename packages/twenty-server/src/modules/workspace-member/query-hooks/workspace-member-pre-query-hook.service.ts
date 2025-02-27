import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

@Injectable()
export class WorkspaceMemberPreQueryHookService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async validateWorkspaceMemberUpdatePermissionOrThrow({
    userWorkspaceId,
    workspaceMemberId,
    targettedWorkspaceMemberId,
    workspaceId,
    apiKey,
  }: {
    userWorkspaceId?: string;
    workspaceMemberId?: string;
    targettedWorkspaceMemberId?: string;
    workspaceId: string;
    apiKey?: ApiKeyWorkspaceEntity | null;
  }) {
    if (isDefined(apiKey)) {
      return;
    }

    if (!userWorkspaceId) {
      throw new PermissionsException(
        PermissionsExceptionMessage.USER_WORKSPACE_NOT_FOUND,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    if (
      isDefined(targettedWorkspaceMemberId) &&
      workspaceMemberId === targettedWorkspaceMemberId
    ) {
      return;
    }

    if (
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        _setting: SettingsPermissions.WORKSPACE_MEMBERS,
      })
    ) {
      return;
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
}
