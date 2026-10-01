import { Injectable } from '@nestjs/common';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import {
  type SendInboxMessageInput,
  type SendInboxMessageResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxMessageRequestPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-request-part.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentInboxService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Every record has an id derived from the keys: the thread key picks the
  // conversation, and the idempotency key the message in it, so a retry or a
  // concurrent send completes the same message instead of writing another.
  // The application's message is written last: once it exists, it is done.
  async sendMessage({
    workspaceId,
    application,
    input,
  }: {
    workspaceId: string;
    application: FlatApplication;
    input: SendInboxMessageInput;
  }): Promise<SendInboxMessageResult> {
    const { threadId, turnId, openingMessageId, messageId } =
      buildInboxMessageIds({
        applicationId: application.id,
        workspaceMemberId: input.workspaceMemberId,
        threadKey: input.threadKey,
        idempotencyKey: input.idempotencyKey,
      });
    const request = isDefined(input.request)
      ? buildInboxMessageRequestPart({
          request: input.request,
          toolCallId: `call_${messageId.replace(/-/g, '')}`,
          findApplicationTool: await this.buildApplicationToolFinder({
            workspaceId,
            applicationId: application.id,
          }),
        })
      : undefined;

    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    // A member who deleted the conversation has dismissed it.
    if (isDefined(existingThread?.deletedAt)) {
      return { threadId };
    }

    const thread =
      existingThread ??
      (await this.agentChatService.createThread({
        workspaceId,
        workspaceMemberId: input.workspaceMemberId,
        id: threadId,
        title: input.title,
      }));

    if (await this.messageExists({ workspaceId, id: messageId })) {
      return { threadId };
    }

    // Only one request waits on the member at a time: a second would leave
    // the first one unanswerable.
    if (
      request?.isAwaitingAnswer === true &&
      isDefined(thread.pendingQuestionMessageId) &&
      thread.pendingQuestionMessageId !== messageId
    ) {
      throw new AiException(
        'The conversation is waiting for an answer to an earlier request',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }

    const existingTurn = await this.turnRepository.findOne(workspaceId, {
      where: { id: turnId },
    });

    if (!isDefined(existingTurn)) {
      await this.conversationWriterService.insertTurn({
        workspaceId,
        id: turnId,
        threadId,
        agentId: null,
      });
    }

    if (!(await this.messageExists({ workspaceId, id: openingMessageId }))) {
      // Answering a request resolves who may answer from the user message of
      // its turn, and models expect a conversation to open with one. It holds
      // no application text, so nothing the application wrote reads as the
      // member's request.
      await this.conversationWriterService.insertMessage({
        workspaceId,
        id: openingMessageId,
        threadId,
        turnId,
        role: AgentMessageRole.USER,
        agentId: null,
        senderUserWorkspaceId: thread.userWorkspaceId,
        isHidden: true,
        parts: [
          {
            type: 'text',
            text: `The "${application.name}" application started this conversation. Its messages follow.`,
          },
        ],
      });
    }

    if (request?.isAwaitingAnswer === true) {
      await this.conversationWriterService.markAwaitingAnswer({
        workspaceId,
        threadId,
        messageId,
      });
    }

    const parts: ExtendedUIMessagePart[] = [{ type: 'text', text: input.text }];

    if (isDefined(request)) {
      parts.push(request.part);
    }

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: messageId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      senderApplicationId: application.id,
      parts,
    });

    await this.agentChatService.notifyThreadActivityUpdated({
      threadId,
      workspaceMemberId: input.workspaceMemberId,
      workspaceId,
    });

    return { threadId };
  }

  private async messageExists({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<boolean> {
    return isDefined(
      await this.messageRepository.findOne(workspaceId, {
        where: { id },
        select: ['id'],
      }),
    );
  }

  private async buildApplicationToolFinder({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }) {
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    return (logicFunctionUniversalIdentifier: string) => {
      const logicFunction =
        flatLogicFunctionMaps.byUniversalIdentifier[
          logicFunctionUniversalIdentifier
        ];

      return logicFunction?.applicationId === applicationId &&
        !isDefined(logicFunction.deletedAt)
        ? logicFunction
        : undefined;
    };
  }
}
