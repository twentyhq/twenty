import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { AgentChatAssistantPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-policy.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatAssistantParticipationArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation-args.type';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

@Injectable()
export class AgentChatAssistantParticipationService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly assistantPolicyService: AgentChatAssistantPolicyService,
    private readonly sharingService: AgentChatSharingService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async resolveAssistantParticipation({
    workspaceId,
    workspaceMemberId,
    thread,
    isInitialMessage: providedIsInitialMessage,
    isUncommittedThread = false,
    transactionScope,
    isAssistantMentioned = false,
    isInitialAssistantParticipant,
    isReplyRequested = true,
    recipientWorkspaceMemberIds = [],
    mentionedWorkspaceMemberIds = [],
  }: AgentChatAssistantParticipationArgs & {
    workspaceId: string;
    workspaceMemberId: string;
    thread: AgentChatThreadWorkspaceEntity;
    isInitialMessage?: boolean;
    isReplyRequested?: boolean;
    isUncommittedThread?: boolean;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<AgentChatAssistantParticipation> {
    await this.sharingService.assertHasMentionResolutionOrThrow(workspaceId);

    const isInitialMessage =
      providedIsInitialMessage ??
      !(await this.messageRepository.existsBy(workspaceId, {
        threadId: thread.id,
        role: Not(AgentMessageRole.SYSTEM),
      }));
    const eligibleWorkspaceMemberIds =
      await this.sharingService.findEligibleParticipantWorkspaceMemberIds({
        workspaceId,
        workspaceMemberId,
        threadId: thread.id,
        transactionScope,
        memberIds: [
          ...mentionedWorkspaceMemberIds,
          ...(isInitialMessage ? recipientWorkspaceMemberIds : []),
        ],
      });
    const assistantMessageDecision =
      await this.assistantPolicyService.resolveAssistantMessageDecisionOrThrow({
        workspaceId,
        thread,
        candidateWorkspaceMemberIds: [
          workspaceMemberId,
          ...eligibleWorkspaceMemberIds,
        ],
        isAssistantMentioned,
        isInitialAssistantParticipant,
        isInitialMessage,
        isReplyRequested,
        isUncommittedThread,
        hasRequestedRecipients:
          isNonEmptyArray(recipientWorkspaceMemberIds) ||
          isNonEmptyArray(mentionedWorkspaceMemberIds),
      });

    return { ...assistantMessageDecision, isInitialMessage };
  }

  async persistAssistantParticipation({
    workspaceId,
    thread,
    participation,
    scope,
    shouldEmitEvent = true,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    participation: Pick<
      AgentChatAssistantParticipation,
      'isAssistantParticipant'
    >;
    scope?: AgentHistoryTransactionScope;
    shouldEmitEvent?: boolean;
  }): Promise<void> {
    const { isAssistantParticipant } = participation;

    if (thread.isAssistantParticipant === isAssistantParticipant) {
      return;
    }

    const persistParticipationWithinTransaction = async (
      transactionScope: AgentHistoryTransactionScope,
    ) => {
      const updatedThreadCount = await transactionScope.update({
        name: 'agentChatThread',
        where: {
          id: thread.id,
          isAssistantParticipant: !isAssistantParticipant,
        },
        values: { isAssistantParticipant },
      });

      if (updatedThreadCount > 0 && shouldEmitEvent) {
        transactionScope.afterCommit(() =>
          this.threadRecordEventService.emitThreadUpdated({
            workspaceId,
            threadBefore: thread,
          }),
        );
      }
    };

    if (isDefined(scope)) {
      await persistParticipationWithinTransaction(scope);

      return;
    }

    await this.conversationWriterService.runInTransaction({
      workspaceId,
      threadId: thread.id,
      work: persistParticipationWithinTransaction,
    });
  }
}
