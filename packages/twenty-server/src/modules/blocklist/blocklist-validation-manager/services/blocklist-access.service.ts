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
export class BlocklistAccessService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canUserCreateBlocklistEntry({
    item,
    context,
  }: {
    item: Partial<Pick<BlocklistItem, 'scope' | 'workspaceMemberId'>>;
    context: BlocklistMutationContext;
  }): Promise<boolean> {
    const scope = item.scope ?? BlocklistScope.WORKSPACE_MEMBER;

    if (scope === BlocklistScope.WORKSPACE_MEMBER) {
      if (item.workspaceMemberId !== context.workspaceMemberId) {
        this.throwForeignOwnerDenied();
      }

      return true;
    }

    if (isDefined(item.workspaceMemberId)) {
      this.throwWorkspaceEntryCannotTargetMember();
    }

    if (await this.hasWorkspaceBlocklistPermission(context)) {
      return true;
    }

    this.throwWorkspacePermissionDenied();
  }

  async canUserModifyBlocklistEntry({
    entry,
    context,
  }: {
    entry: Pick<BlocklistWorkspaceEntity, 'scope' | 'workspaceMemberId'>;
    context: BlocklistMutationContext;
  }): Promise<boolean> {
    const isOwnMemberScopedEntry =
      entry.scope === BlocklistScope.WORKSPACE_MEMBER &&
      entry.workspaceMemberId === context.workspaceMemberId;

    if (isOwnMemberScopedEntry) {
      return true;
    }

    if (await this.hasWorkspaceBlocklistPermission(context)) {
      return true;
    }

    this.throwWorkspacePermissionDenied();
  }

  private async hasWorkspaceBlocklistPermission(
    context: BlocklistMutationContext,
  ): Promise<boolean> {
    return this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId: context.userWorkspaceId,
      setting: PermissionFlagType.WORKSPACE,
      workspaceId: context.workspaceId,
    });
  }

  private throwWorkspacePermissionDenied(): never {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to manage the workspace blocklist.`,
      },
    );
  }

  private throwForeignOwnerDenied(): never {
    throw new CommonQueryRunnerException(
      'A workspace-member-scoped blocklist entry must target its own workspace member',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Cannot manage a blocklist entry of another workspace member.`,
      },
    );
  }

  private throwWorkspaceEntryCannotTargetMember(): never {
    throw new CommonQueryRunnerException(
      'A workspace-scoped blocklist entry cannot target a workspace member',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`A workspace-wide blocklist entry cannot target a workspace member.`,
      },
    );
  }
}
