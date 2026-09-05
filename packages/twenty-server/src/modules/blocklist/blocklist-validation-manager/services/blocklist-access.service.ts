import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { BlocklistScope } from 'twenty-shared/types';

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

  async assertCanCreateBlocklistEntryOrThrow({
    item,
    context,
  }: {
    item: Partial<Pick<BlocklistItem, 'scope'>>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const scope = item.scope ?? BlocklistScope.WORKSPACE_MEMBER;

    if (scope === BlocklistScope.WORKSPACE_MEMBER) {
      return;
    }

    if (await this.hasWorkspaceBlocklistPermission(context)) {
      return;
    }

    this.throwWorkspacePermissionDenied();
  }

  async assertCanModifyBlocklistEntryOrThrow({
    entry,
    context,
  }: {
    entry: Pick<BlocklistWorkspaceEntity, 'scope' | 'workspaceMemberId'>;
    context: BlocklistMutationContext;
  }): Promise<void> {
    const isOwnMemberScopedEntry =
      entry.scope === BlocklistScope.WORKSPACE_MEMBER &&
      entry.workspaceMemberId === context.workspaceMemberId;

    if (isOwnMemberScopedEntry) {
      return;
    }

    if (await this.hasWorkspaceBlocklistPermission(context)) {
      return;
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
}
