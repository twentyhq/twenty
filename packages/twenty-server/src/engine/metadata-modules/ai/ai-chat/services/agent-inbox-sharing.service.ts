import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { type RecordShareEntry } from 'src/engine/core-modules/record-share/types/record-share-entry.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveRecordShareEntriesOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-entries-or-throw.util';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentInboxSharingService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly inboxAccessService: AgentInboxAccessService,
    private readonly sharingService: AgentChatSharingService,
    private readonly recordSharingService: RecordSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async shareThread({
    authContext,
    threadId,
    grants,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
    grants: ShareWithInput[];
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;
    const threadBefore = await this.getThreadToShare({
      authContext,
      threadId,
    });
    const shareEntries = await this.resolveShareEntries({
      workspaceId,
      grants,
    });

    await this.assertMemberGranteesCanUseChats({ workspaceId, shareEntries });
    await this.writeShareEntries({ authContext, threadId, shareEntries });
    await this.touchThread({ workspaceId, threadId });
    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore,
    });
  }

  private async getThreadToShare({
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    if (isUserAuthContext(authContext)) {
      return this.inboxAccessService.getWritableThread({
        authContext,
        threadId,
      });
    }

    const workspaceId = authContext.workspace.id;
    const thread = await this.inboxAccessService.getThreadOrThrow({
      workspaceId,
      threadId,
    });

    await this.inboxAccessService.assertApplicationParticipatesInThread({
      workspaceId,
      application: authContext.application,
      threadId,
    });

    return thread;
  }

  private async resolveShareEntries({
    workspaceId,
    grants,
  }: {
    workspaceId: string;
    grants: ShareWithInput[];
  }): Promise<RecordShareEntry[]> {
    const { flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'flatRoleMaps',
      ]);

    return resolveRecordShareEntriesOrThrow({
      shareWith: grants,
      flatWorkspaceMemberMaps,
      flatRoleMaps,
    });
  }

  private async assertMemberGranteesCanUseChats({
    workspaceId,
    shareEntries,
  }: {
    workspaceId: string;
    shareEntries: RecordShareEntry[];
  }): Promise<void> {
    const granteeWorkspaceMemberIds = shareEntries
      .filter(
        ({ principalType, accessLevel }) =>
          principalType === RecordSharePrincipalType.WORKSPACE_MEMBER &&
          accessLevel !== RecordShareAccessLevel.NONE,
      )
      .map(({ principalId }) => principalId);

    await Promise.all(
      granteeWorkspaceMemberIds.map((workspaceMemberId) =>
        this.assertMemberCanUseChats({ workspaceId, workspaceMemberId }),
      ),
    );
  }

  private async assertMemberCanUseChats({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<void> {
    try {
      await this.sharingService.getAuthContext({
        workspaceId,
        workspaceMemberId,
      });
    } catch (error) {
      const isMemberUnableToUseChats =
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND;

      if (!isMemberUnableToUseChats) {
        throw error;
      }

      throw new AiException(
        `Workspace member ${workspaceMemberId} cannot use chats`,
        AiExceptionCode.CHAT_THREAD_GRANTEE_CANNOT_USE_CHATS,
      );
    }
  }

  private async writeShareEntries({
    authContext,
    threadId,
    shareEntries,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
    shareEntries: RecordShareEntry[];
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;
    const threadTarget = {
      objectMetadataId:
        await this.sharingService.getThreadObjectMetadataId(workspaceId),
      recordId: threadId,
    };

    if (isUserAuthContext(authContext)) {
      await this.recordSharingService.setShares({
        ...threadTarget,
        authContext,
        shareEntries,
      });

      return;
    }

    await this.recordSharingService.writeSharesAsSystem({
      ...threadTarget,
      workspaceId,
      shareEntries,
    });
  }

  private async touchThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentChatThread')} SET "updatedAt" = now() WHERE id = $1`,
        [threadId],
      ),
    );
  }
}
