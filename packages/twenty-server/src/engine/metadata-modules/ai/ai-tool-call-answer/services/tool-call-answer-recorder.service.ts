import { Injectable } from '@nestjs/common';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadParticipantWrite } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-write.type';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { buildToolCallStatusWhere } from 'src/engine/metadata-modules/ai/ai-history/utils/build-tool-call-status-where.util';
import { buildToolCallNotPendingException } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/utils/build-tool-call-not-pending-exception.util';

@Injectable()
export class ToolCallAnswerRecorderService {
  constructor(
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly participantEventService: AgentChatThreadParticipantEventService,
  ) {}

  async findAwaitingToolParts({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<
    Pick<AgentMessagePartWorkspaceEntity, 'id' | 'toolName' | 'toolOutput'>[]
  > {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['id', 'toolName', 'toolOutput'],
    });

    return parts.filter((part) => isDefined(findAwaitingPausingTool(part)));
  }

  // only a still-pending call is claimed, so two answers never both run it
  async claimToolCallAnswerOrThrow({
    threadId,
    partId,
    pendingToolOutput,
    toolOutput,
    workspaceId,
    workspaceMemberId,
  }: AgentChatThreadAccessArgs & {
    partId: string;
    pendingToolOutput: unknown;
    toolOutput: Record<string, unknown>;
  }): Promise<void> {
    if (!isPlainObject(pendingToolOutput)) {
      throw buildToolCallNotPendingException();
    }

    const mentionAccess = { workspaceId, workspaceMemberId, threadId };

    await this.sharingService.assertHasMentionResolutionOrThrow(workspaceId);

    const participantWrite =
      await this.conversationWriterService.runInTransaction(
        workspaceId,
        async (scope) => {
          await this.participantService.lockInTransaction({
            scope,
            ...mentionAccess,
          });

          const mentionResolution = await this.resolveMentionInTransaction({
            scope,
            ...mentionAccess,
          });
          const claimedPartCount = await scope.update(
            'agentMessagePart',
            { id: partId, toolOutput: buildToolCallStatusWhere('pending') },
            { toolOutput: { ...pendingToolOutput, ...toolOutput } },
          );

          if (claimedPartCount !== 1) {
            throw buildToolCallNotPendingException();
          }

          return mentionResolution;
        },
      );

    await this.emitParticipantWrite({ workspaceId, participantWrite });
  }

  // written together so an answer never strands a conversation waiting on answered calls
  async recordToolCallAnswer({
    threadId,
    messageId,
    partId,
    toolOutput,
    isLastAnswer,
    workspaceId,
    resolveMentionForWorkspaceMemberId,
  }: {
    threadId: string;
    messageId: string;
    partId: string;
    toolOutput: Record<string, unknown>;
    isLastAnswer: boolean;
    workspaceId: string;
    resolveMentionForWorkspaceMemberId: string | null;
  }): Promise<void> {
    const mentionAccess = isDefined(resolveMentionForWorkspaceMemberId)
      ? {
          workspaceId,
          workspaceMemberId: resolveMentionForWorkspaceMemberId,
          threadId,
        }
      : null;

    if (isDefined(mentionAccess)) {
      await this.sharingService.assertHasMentionResolutionOrThrow(workspaceId);
    }

    const turnId = isLastAnswer
      ? await this.findMessageTurnId({ workspaceId, messageId })
      : null;

    const { isPendingQuestionCleared, participantWrite } =
      await this.conversationWriterService.runInTransaction(
        workspaceId,
        async (scope) => {
          if (isDefined(mentionAccess)) {
            await this.participantService.lockInTransaction({
              scope,
              ...mentionAccess,
            });
          }

          const clearedThreadCount = isLastAnswer
            ? await scope.update(
                'agentChatThread',
                { id: threadId, pendingQuestionMessageId: messageId },
                { pendingQuestionMessageId: null },
              )
            : 0;
          const mentionResolution = isDefined(mentionAccess)
            ? await this.resolveMentionInTransaction({
                scope,
                ...mentionAccess,
              })
            : null;

          await scope.update(
            'agentMessagePart',
            { id: partId },
            { toolOutput },
          );

          if (clearedThreadCount > 0 && isDefined(turnId)) {
            await scope.update(
              'agentTurn',
              { id: turnId, status: AgentTurnStatus.WAITING_FOR_INPUT },
              {
                status: AgentTurnStatus.COMPLETED,
                endedAt: new Date().toISOString(),
              },
            );
          }

          return {
            isPendingQuestionCleared: clearedThreadCount > 0,
            participantWrite: mentionResolution,
          };
        },
      );

    await this.emitParticipantWrite({ workspaceId, participantWrite });

    if (isPendingQuestionCleared) {
      await this.threadRecordEventService.emitPendingQuestionCleared({
        workspaceId,
        threadId,
        messageId,
      });
    }
  }

  private async findMessageTurnId({
    workspaceId,
    messageId,
  }: {
    workspaceId: string;
    messageId: string;
  }): Promise<string | null> {
    const message = await this.messageRepository.findOne(workspaceId, {
      where: { id: messageId },
      select: ['id', 'turnId'],
    });

    return message?.turnId ?? null;
  }

  private async resolveMentionInTransaction({
    scope,
    ...args
  }: AgentChatThreadAccessArgs & {
    scope: AgentHistoryTransactionScope;
  }): Promise<AgentChatThreadParticipantWrite | null> {
    const before = await this.participantService.findOneInTransaction({
      scope,
      ...args,
    });
    const after = await this.participantService.resolveMentionInTransaction({
      scope,
      ...args,
    });

    return isDefined(after) ? { before, after } : null;
  }

  private async emitParticipantWrite({
    workspaceId,
    participantWrite,
  }: {
    workspaceId: string;
    participantWrite: AgentChatThreadParticipantWrite | null;
  }): Promise<void> {
    if (!isDefined(participantWrite)) {
      return;
    }

    await this.participantEventService.emitParticipantWritten({
      workspaceId,
      ...participantWrite,
    });
  }
}
