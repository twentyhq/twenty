import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
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
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  askQuestionsInputSchema,
  buildAskQuestionsPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// An application starts a conversation in a workspace member's chats: its
// message comes first, and its questions are answered like any agent's.
@Injectable()
export class AgentInboxService {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly conversationWriterService: AgentConversationWriterService,
  ) {}

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

    const thread = await this.agentChatService.createThread({
      workspaceId,
      workspaceMemberId: input.workspaceMemberId,
      title: input.title,
    });

    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId: thread.id,
      agentId: null,
    });

    // Answering a question resolves who may answer from the user message of
    // its turn, and models expect a conversation to open with one, so the
    // turn starts with a hidden message from the member it is addressed to.
    await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId: thread.id,
      turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: thread.userWorkspaceId,
      isHidden: true,
      parts: [
        {
          type: 'text',
          text: this.buildOpeningContext({
            applicationName: application.name,
            context: input.context,
          }),
        },
      ],
    });

    const messageId = await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId: thread.id,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      senderApplicationId: application.id,
      parts: [
        { type: 'text', text: input.text },
        ...(isDefined(questions)
          ? [
              {
                type: `tool-${ASK_QUESTIONS_TOOL_NAME}`,
                toolCallId: randomUUID(),
                state: 'output-available',
                input: { questions },
                output: buildAskQuestionsPendingOutput({ questions }),
              } as ExtendedUIMessagePart,
            ]
          : []),
      ],
    });

    if (isDefined(questions)) {
      await this.conversationWriterService.markAwaitingAnswer({
        workspaceId,
        threadId: thread.id,
        messageId,
      });
    }

    return { threadId: thread.id };
  }

  // The member never sees this message: it tells the model who started the
  // conversation and what it is about, for when the member replies.
  private buildOpeningContext({
    applicationName,
    context,
  }: {
    applicationName: string;
    context?: string;
  }): string {
    const opening = `The "${applicationName}" application started this conversation with the message that follows.`;

    return isNonEmptyString(context)
      ? `${opening}\n\nContext from the application:\n${context}`
      : opening;
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
