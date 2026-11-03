import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { DirectMessageFileAccessService } from 'src/engine/permissions/direct-message/services/direct-message-file-access.service';

@Injectable()
export class AgentChatFileAccessService {
  constructor(
    private readonly directMessageFileAccessService: DirectMessageFileAccessService,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
  ) {}

  async assertFilesReadableOrThrow({
    workspaceId,
    workspaceMemberId,
    fileIds,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    fileIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(fileIds)) {
      return;
    }

    const storedAuthContext = workspaceAuthContextStorage.getStore();
    const hasMatchingUserContext =
      isDefined(storedAuthContext) &&
      isUserAuthContext(storedAuthContext) &&
      storedAuthContext.workspace.id === workspaceId &&
      storedAuthContext.workspaceMemberId === workspaceMemberId;

    await this.directMessageFileAccessService.assertFilesReadableOrThrow({
      workspaceId,
      fileIds,
      authContext: hasMatchingUserContext
        ? storedAuthContext
        : await this.userWorkspaceAuthContextService.resolveWorkspaceMember({
            workspaceId,
            workspaceMemberId,
          }),
    });
  }
}
