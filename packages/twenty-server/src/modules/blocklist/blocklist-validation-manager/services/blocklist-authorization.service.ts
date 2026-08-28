import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type BlocklistItem } from 'src/modules/blocklist/types/blocklist-item.type';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';

@Injectable()
export class BlocklistAuthorizationService {
  constructor(private readonly permissionsService: PermissionsService) {}

  public async assertCallerCanCreateEntry({
    item,
    context,
  }: {
    item: Partial<Pick<BlocklistItem, 'scope' | 'workspaceMemberId'>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    if (
      (item.scope ?? BlocklistScope.WORKSPACE_MEMBER) ===
      BlocklistScope.WORKSPACE
    ) {
      if (isDefined(item.workspaceMemberId)) {
        throw new CommonQueryRunnerException(
          'A workspace-scoped blocklist entry cannot target a workspace member',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`A workspace-wide blocklist entry cannot target a workspace member.`,
          },
        );
      }

      await this.assertHasWorkspaceBlocklistPermission(context);

      return;
    }

    if (item.workspaceMemberId !== context.workspaceMemberId) {
      throw new CommonQueryRunnerException(
        'A workspace-member-scoped blocklist entry must target its own workspace member',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`Cannot manage a blocklist entry of another workspace member.`,
        },
      );
    }
  }

  public async assertCanManageExistingRecord({
    existingRecord,
    context,
  }: {
    existingRecord: BlocklistWorkspaceEntity;
    context: BlocklistMutationContext;
  }): Promise<void> {
    if (
      existingRecord.scope === BlocklistScope.WORKSPACE_MEMBER &&
      existingRecord.workspaceMemberId === context.workspaceMemberId
    ) {
      return;
    }

    await this.assertHasWorkspaceBlocklistPermission(context);
  }

  public assertScopeAndOwnerAreUnchanged({
    data,
    existingRecord,
  }: {
    data: Partial<BlocklistItem>;
    existingRecord: BlocklistWorkspaceEntity;
  }): void {
    if ('scope' in data && data.scope !== existingRecord.scope) {
      throw new CommonQueryRunnerException(
        'Blocklist scope cannot be updated',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Blocklist scope cannot be updated.` },
      );
    }

    if (
      'workspaceMemberId' in data &&
      data.workspaceMemberId !== existingRecord.workspaceMemberId
    ) {
      throw new CommonQueryRunnerException(
        'Workspace member cannot be updated',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Workspace member cannot be updated.` },
      );
    }
  }

  private async assertHasWorkspaceBlocklistPermission(
    context: BlocklistMutationContext,
  ): Promise<void> {
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: context.userWorkspaceId,
        setting: PermissionFlagType.WORKSPACE,
        workspaceId: context.workspaceId,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to manage the workspace blocklist.`,
        },
      );
    }
  }
}
