/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { type CurrentUserWorkspacePermissions } from 'src/engine/permissions/types/current-user-workspace-permissions.type';

@Injectable()
export class UserWorkspacePermissionsReadService {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
  ) {}

  async findCurrentUserWorkspacePermissions({
    workspace,
    userWorkspaceId,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'activationStatus'>;
    userWorkspaceId: string;
  }): Promise<CurrentUserWorkspacePermissions> {
    if (
      [
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(workspace.activationStatus)
    ) {
      return {
        ...this.settingPermissionsService.getDefaultUserWorkspacePermissions(),
        objectMetadataIdsWithReadableRecords: new Set(),
      };
    }

    const principals =
      await this.principalPermissionsReadService.resolveUserWorkspacePermissionsPrincipalsOrThrow(
        { workspaceId: workspace.id, userWorkspaceId },
      );

    return {
      ...(await this.settingPermissionsService.getUserWorkspacePermissions({
        workspaceId: workspace.id,
        userWorkspaceId,
      })),
      objectMetadataIdsWithReadableRecords:
        await this.recordPermissionsReadService.findObjectMetadataIdsWithReadableRecords(
          { principals },
        ),
    };
  }
}
