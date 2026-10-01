import { Injectable } from '@nestjs/common';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import {
  type SendInboxMessageInput,
  type SendInboxMessageResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxMessageRequestPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-request-part.util';
import { getAgentInboxSenderDetails } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-sender-details.util';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
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
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Every record has an id derived from the keys: the thread key picks the
  // conversation, and the idempotency key the message in it, so a retry or a
  // concurrent send completes the same message instead of writing another.
  // The sender's message is written last: once it exists, it is done.
  async sendMessage({
    workspaceId,
    sender,
    input,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    input: SendInboxMessageInput;
  }): Promise<SendInboxMessageResult> {
    const senderDetails = getAgentInboxSenderDetails(sender);
    const { threadId, turnId, openingMessageId, messageId } =
      buildInboxMessageIds({
        senderKey: senderDetails.key,
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
            applicationId: senderDetails.applicationId,
          }),
        })
      : undefined;

    const existingThread = await this.findThread({ workspaceId, threadId });

    // A member who deleted the conversation has dismissed it.
    if (isDefined(existingThread?.deletedAt)) {
      return { threadId };
    }

    const thread =
      existingThread ??
      (await this.createThread({
        workspaceId,
        threadId,
        workspaceMemberId: input.workspaceMemberId,
        title: input.title,
      }));

    if (await this.messageExists({ workspaceId, id: messageId })) {
      return { threadId };
    }

    if (request?.isAwaitingAnswer) {
      await this.claimPendingRequest({ workspaceId, threadId, messageId });
    }

    await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertTurn({
        workspaceId,
        id: turnId,
        threadId,
        agentId: null,
      }),
    );

    // Answering a request resolves who may answer from the user message of
    // its turn, and models expect a conversation to open with one. It holds
    // no text from the sender, so nothing the sender wrote reads as the
    // member's request.
    await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertMessage({
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
            text: `${senderDetails.description} started this conversation. Its messages follow.`,
          },
        ],
      }),
    );

    const parts: ExtendedUIMessagePart[] = [{ type: 'text', text: input.text }];

    if (isDefined(request)) {
      parts.push(request.part);
    }

    const isWritten = await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertMessage({
        workspaceId,
        id: messageId,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId: null,
        senderUserWorkspaceId: null,
        senderApplicationId: senderDetails.applicationId,
        parts,
      }),
    );

    if (isWritten) {
      await this.threadService.notifyThreadActivityUpdated({
        threadId,
        workspaceMemberId: input.workspaceMemberId,
        workspaceId,
      });
    }

    return { threadId };
  }

  private findThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }) {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
  }

  private async createThread({
    workspaceId,
    threadId,
    workspaceMemberId,
    title,
  }: {
    workspaceId: string;
    threadId: string;
    workspaceMemberId: string;
    title: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    try {
      return await this.threadService.createThread({
        workspaceId,
        workspaceMemberId,
        id: threadId,
        title,
      });
    } catch (error) {
      const concurrentlyCreatedThread = isUniqueViolationError(error)
        ? await this.findThread({ workspaceId, threadId })
        : null;

      if (!isDefined(concurrentlyCreatedThread)) {
        throw error;
      }

      return concurrentlyCreatedThread;
    }
  }

  // Only one request waits on the member at a time: a second would leave
  // the first one unanswerable. The slot is taken in a single conditional
  // write so concurrent sends cannot both take it.
  private async claimPendingRequest({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<void> {
    const { affected } = await this.threadRepository.update(
      workspaceId,
      { id: threadId, pendingQuestionMessageId: IsNull() },
      { pendingQuestionMessageId: messageId },
    );

    if (affected > 0) {
      return;
    }

    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'pendingQuestionMessageId'],
    });

    if (thread?.pendingQuestionMessageId !== messageId) {
      throw new AiException(
        'The conversation is waiting for an answer to an earlier request',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }
  }

  // Every id is derived from the keys, so a row that already exists was
  // written by a concurrent send of the same conversation.
  private async ignoreDuplicate(write: () => Promise<unknown>) {
    try {
      await write();

      return true;
    } catch (error) {
      if (isUniqueViolationError(error)) {
        return false;
      }

      throw error;
    }
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
    applicationId: string | null;
  }) {
    if (!isDefined(applicationId)) {
      return () => undefined;
    }

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
