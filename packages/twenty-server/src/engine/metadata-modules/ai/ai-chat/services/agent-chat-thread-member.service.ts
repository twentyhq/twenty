import { Injectable, Logger } from '@nestjs/common';

import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';
import { buildAgentChatThreadMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-members.util';
import { findAgentChatReplyMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-reply-mentioned-workspace-member-ids.util';
import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AgentChatThreadMemberThread = Pick<
  AgentChatThreadWorkspaceEntity,
  | 'id'
  | 'workspaceMemberId'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;

@Injectable()
export class AgentChatThreadMemberService {
  private readonly logger = new Logger(AgentChatThreadMemberService.name);

  constructor(
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findMembers({
    workspaceId,
    thread,
    currentWorkspaceMemberId,
  }: {
    workspaceId: string;
    thread: AgentChatThreadMemberThread;
    currentWorkspaceMemberId: string;
  }): Promise<AgentChatThreadMember[]> {
    const [participantWorkspaceMemberIds, { flatWorkspaceMemberMaps }] =
      await Promise.all([
        this.participantService.findWorkspaceMemberIds({
          workspaceId,
          threadId: thread.id,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]),
      ]);

    return buildAgentChatThreadMembers({
      thread,
      participantWorkspaceMemberIds,
      workspaceMemberById: flatWorkspaceMemberMaps.byId,
      currentWorkspaceMemberId,
    });
  }

  async deliverReplyMentions({
    workspaceId,
    thread,
    senderWorkspaceMemberId,
    messageId,
    replyText,
  }: {
    workspaceId: string;
    thread: AgentChatThreadMemberThread &
      Pick<AgentChatThreadWorkspaceEntity, 'conversationType'>;
    senderWorkspaceMemberId: string;
    messageId: string;
    replyText: string;
  }): Promise<void> {
    if (
      thread.conversationType ===
        AgentChatThreadConversationType.DIRECT_MESSAGE ||
      !isNonEmptyArray(
        extractInboxMessageMentionedWorkspaceMemberIds(replyText),
      )
    ) {
      return;
    }

    try {
      const workspaceMemberIds = findAgentChatReplyMentionedWorkspaceMemberIds({
        replyText,
        members: await this.findMembers({
          workspaceId,
          thread,
          currentWorkspaceMemberId: senderWorkspaceMemberId,
        }),
      });

      if (!isNonEmptyArray(workspaceMemberIds)) {
        return;
      }

      await this.inboxDeliveryService.deliverThreadToMemberInboxes({
        workspaceId,
        threadId: thread.id,
        workspaceMemberId: senderWorkspaceMemberId,
        workspaceMemberIds,
        reason: AgentChatInboxDeliveryReason.MENTION,
      });
    } catch (error) {
      this.logger.warn(
        doNotTranslate(
          `Could not deliver mentions for assistant reply ${messageId} in thread ${thread.id} of workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );
    }
  }
}
