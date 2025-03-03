import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

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
    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const isPermissionsEnabled =
      featureFlagsMap[FeatureFlagKey.IsPermissionsEnabled];

    if (!isPermissionsEnabled) {
      return;
    }

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
        isExecutedByApiKey: isDefined(apiKey),
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
