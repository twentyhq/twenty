import { Injectable } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import {
  type SendInboxMessageInput,
  type SendInboxMessageResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  askQuestionsInputSchema,
  buildAskQuestionsPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
  ) {}

  // Every record of the conversation has an id derived from the idempotency
  // key, so a retry or a concurrent send completes the same conversation
  // instead of starting another one. The application's message is written
  // last: once it exists, the conversation is complete.
  async sendMessage({
    workspaceId,
    application,
    input,
  }: {
    workspaceId: string;
    application: FlatApplication;
    input: SendInboxMessageInput;
  }): Promise<SendInboxMessageResult> {
    const questions = isDefined(input.questions)
      ? this.parseQuestions(input.questions)
      : undefined;
    const { threadId, turnId, openingMessageId, messageId } =
      buildInboxMessageIds({
        applicationId: application.id,
        workspaceMemberId: input.workspaceMemberId,
        idempotencyKey: input.idempotencyKey,
      });

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
      // Answering a question resolves who may answer from the user message of
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
            text: `The "${application.name}" application started this conversation with the message that follows.`,
          },
        ],
      });
    }

    if (isDefined(questions)) {
      await this.conversationWriterService.markAwaitingAnswer({
        workspaceId,
        threadId,
        messageId,
      });
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
      parts: [
        { type: 'text', text: input.text },
        ...(isDefined(questions)
          ? [this.buildAskQuestionsPart(questions)]
          : []),
      ],
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

  private buildAskQuestionsPart(
    questions: AskQuestionItem[],
  ): ExtendedUIMessagePart {
    return {
      type: `tool-${ASK_QUESTIONS_TOOL_NAME}`,
      toolCallId: `call_${ASK_QUESTIONS_TOOL_NAME}`,
      state: 'output-available',
      input: { questions },
      output: buildAskQuestionsPendingOutput({ questions }),
    };
  }

  private parseQuestions(questions: unknown): AskQuestionItem[] {
    const parseResult = askQuestionsInputSchema.safeParse({ questions });

    if (!parseResult.success) {
      throw new AiException(
        `Invalid inbox message questions: ${parseResult.error.message}`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return parseResult.data.questions;
  }
}
