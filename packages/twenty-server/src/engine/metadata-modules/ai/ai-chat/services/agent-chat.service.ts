import { isNonEmptyString } from '@sniptt/guards';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionAnswer,
  type AskQuestionItem,
  type AskQuestionsToolResult,
  ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentChatThreadDTO } from '../dtos/agent-chat-thread.dto';

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly sharingService: AgentChatSharingService,
  ) {}

  async createThread({
    userWorkspaceId,
    workspaceId,
    id,
    title,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    id?: string;
    title?: string;
  }) {
    const savedThread = await this.sharingService.createThread({
      workspaceId,
      userWorkspaceId,
      id,
      title,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'created',
          entityName: 'agentChatThread',
          recordId: savedThread.id,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            after: serializeAgentChatThreadForBroadcast({
              thread: savedThread,
              lastMessageAt: null,
            }),
          },
        },
      ],
    });

    return savedThread;
  }

  async findThreadById({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    try {
      return await this.sharingService.getThreadWithAccess({
        threadId,
        userWorkspaceId,
        workspaceId,
        operationType: 'update',
      });
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async getThreadById(args: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    return this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });
  }

  async getThreadsForUser({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<(AgentChatThreadEntity & { lastMessageAt: Date | null })[]> {
    const readableThreadIds = await this.sharingService.getReadableThreadIds({
      workspaceId,
      userWorkspaceId,
    });
    const rankedThreads = await this.threadRepository.query(
      workspaceId,
      ({ manager, table, storage }) =>
        manager.query<{ id: string; last_message_at: Date | null }[]>(
          `SELECT thread.id, MAX(message."createdAt") AS last_message_at
       FROM ${table('agentChatThread')} thread
       LEFT JOIN ${table('agentMessage')} message ON message."threadId" = thread.id AND message."isHidden" = false
       WHERE thread.id = ANY($1::uuid[]) ${storage === 'core' ? 'AND thread."workspaceId" = $2' : ''}
       GROUP BY thread.id ORDER BY last_message_at DESC NULLS LAST, thread."updatedAt" DESC`,
          storage === 'core'
            ? [readableThreadIds, workspaceId]
            : [readableThreadIds],
        ),
    );

    if (rankedThreads.length === 0) {
      return [];
    }

    const rankedThreadIds = rankedThreads.map(
      (rankedThread) => rankedThread.id,
    );

    const threads = await this.threadRepository.find(workspaceId, {
      where: { id: In(rankedThreadIds) },
    });

    const permissionsByThreadId =
      await this.sharingService.getPermissionsForThreads({
        workspaceId,
        userWorkspaceId,
        threadIds: rankedThreadIds,
      });

    const threadById = new Map(threads.map((thread) => [thread.id, thread]));

    return rankedThreads.flatMap((rankedThread) => {
      const thread = threadById.get(rankedThread.id);

      return isDefined(thread) &&
        permissionsByThreadId.get(thread.id)?.canRead === true
        ? [
            {
              ...thread,
              lastMessageAt: rankedThread.last_message_at ?? null,
            },
          ]
        : [];
    });
  }

  async getLastMessageAtForThread({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<Date | null> {
    const [result] = await this.messageRepository.query(
      workspaceId,
      ({ manager, table, storage }) =>
        manager.query<{ last_message_at: Date | null }[]>(
          `SELECT MAX("createdAt") AS last_message_at FROM ${table('agentMessage')}
       WHERE "threadId" = $1 AND "isHidden" = false ${storage === 'core' ? 'AND "workspaceId" = $2' : ''}`,
          storage === 'core' ? [threadId, workspaceId] : [threadId],
        ),
    );

    return result?.last_message_at ?? null;
  }

  private getMessageSenderValues({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }) {
    const context = workspaceAuthContextStorage.getStore();
    const applicationId =
      isDefined(context) &&
      isUserAuthContext(context) &&
      context.workspace.id === workspaceId &&
      context.userWorkspaceId === userWorkspaceId
        ? context.application?.id
        : undefined;
    return {
      senderUserWorkspaceId: userWorkspaceId ?? null,
      senderApplicationId: applicationId ?? null,
    };
  }

  async addMessage({
    threadId,
    uiMessage,
    agentId,
    turnId,
    id,
    workspaceId,
    isHidden,
    processedAt,
    userWorkspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    uiMessageParts?: UIMessagePart<UIDataTypes, UITools>[];
    agentId?: string;
    turnId?: string;
    id?: string;
    workspaceId: string;
    isHidden?: boolean;
    processedAt?: Date;
    userWorkspaceId?: string;
  }) {
    let actualTurnId = turnId;

    if (!actualTurnId) {
      const turnInsertResult = await this.turnRepository.insert(workspaceId, {
        threadId,
        agentId: agentId ?? null,
      });

      actualTurnId = turnInsertResult.identifiers[0].id as string;
    }

    const messageValues = {
      ...(id ? { id } : {}),
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: processedAt ?? new Date(),
      ...this.getMessageSenderValues({ workspaceId, userWorkspaceId }),
      ...(isDefined(isHidden) ? { isHidden } : {}),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        finalizeDanglingToolParts(uiMessage.parts),
        savedMessageId,
        workspaceId,
      );

      if (dbParts.length > 0) {
        await this.messagePartRepository.insert(
          workspaceId,
          dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
        );
      }
    }

    return {
      id: savedMessageId,
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: messageValues.processedAt,
      senderUserWorkspaceId: messageValues.senderUserWorkspaceId,
      senderApplicationId: messageValues.senderApplicationId,
      workspaceId,
    } as AgentMessageEntity;
  }

  async upsertAssistantMessage({
    id,
    threadId,
    turnId,
    parts,
    workspaceId,
  }: {
    id: string;
    threadId: string;
    turnId: string;
    parts: ExtendedUIMessage['parts'];
    workspaceId: string;
  }): Promise<void> {
    await this.messageRepository.upsert(
      workspaceId,
      {
        id,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        processedAt: new Date(),
      },
      ['id'],
    );

    await this.messagePartRepository.delete(workspaceId, { messageId: id });

    const dbParts = mapUIMessagePartsToDBParts(
      finalizeDanglingToolParts(parts),
      id,
      workspaceId,
    );

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
    }
  }

  async findLatestSentUserMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<Pick<AgentMessageEntity, 'id' | 'turnId'> | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: {
        threadId,
        role: AgentMessageRole.USER,
        status: AgentMessageStatus.SENT,
      },
      order: {
        processedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
        id: 'DESC',
      },
      select: ['id', 'turnId'],
    });
  }

  async hasConversationMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const visibleMessage = await this.messageRepository.findOne(workspaceId, {
      where: { threadId, isHidden: false },
      select: ['id'],
    });

    return isDefined(visibleMessage);
  }

  async deleteAssistantMessagesForTurn({
    turnId,
    workspaceId,
  }: {
    turnId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messageRepository.delete(workspaceId, {
      turnId,
      role: AgentMessageRole.ASSISTANT,
    });
  }

  async hasMessageById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    const existingMessage = await this.messageRepository.findOne(workspaceId, {
      where: { id },
      select: ['id'],
    });

    return isDefined(existingMessage);
  }

  async getMessagesForThread({
    threadId,
    userWorkspaceId,
    workspaceId,
    includeHidden = false,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
    includeHidden?: boolean;
  }) {
    if (includeHidden) {
      await this.getThreadById({ threadId, userWorkspaceId, workspaceId });
    } else {
      await this.sharingService.getReadableThread({
        threadId,
        userWorkspaceId,
        workspaceId,
      });
    }

    return this.messageRepository.find(workspaceId, {
      where: { threadId, ...(includeHidden ? {} : { isHidden: false }) },
      order: { processedAt: { direction: 'ASC', nulls: 'LAST' } },
      relations: ['parts', 'parts.file'],
    });
  }

  async ensureHiddenKickoffMessage({
    threadId,
    workspaceId,
    text,
    userWorkspaceId,
  }: {
    threadId: string;
    workspaceId: string;
    text: string;
    userWorkspaceId: string;
  }): Promise<{ id: string; turnId: string }> {
    const existingKickoffMessage = await this.messageRepository.findOne(
      workspaceId,
      {
        where: { threadId, isHidden: true },
        relations: ['parts'],
      },
    );

    if (isDefined(existingKickoffMessage)) {
      if (
        isDefined(existingKickoffMessage.turnId) &&
        isNonEmptyArray(existingKickoffMessage.parts)
      ) {
        return {
          id: existingKickoffMessage.id,
          turnId: existingKickoffMessage.turnId,
        };
      }

      await this.messageRepository.delete(workspaceId, {
        id: existingKickoffMessage.id,
      });

      if (isDefined(existingKickoffMessage.turnId)) {
        await this.turnRepository.delete(workspaceId, {
          id: existingKickoffMessage.turnId,
        });
      }
    }

    const savedMessage = await this.addMessage({
      threadId,
      workspaceId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text' as const, text }],
      },
      isHidden: true,
    });

    if (!isDefined(savedMessage.turnId)) {
      throw new AiException(
        'Workspace setup kickoff message was persisted without a turn',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    return { id: savedMessage.id, turnId: savedMessage.turnId };
  }

  async queueMessage({
    threadId,
    text,
    id,
    fileAttachments,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileAttachments?: AiChatFileAttachment[];
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AgentMessageEntity> {
    const messageValues = {
      ...(id ? { id } : {}),
      threadId,
      turnId: null,
      role: AgentMessageRole.USER,
      agentId: null,
      status: AgentMessageStatus.QUEUED,
      ...this.getMessageSenderValues({ workspaceId, userWorkspaceId }),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    const validFiles =
      fileAttachments && fileAttachments.length > 0
        ? await this.fileRepository.find(workspaceId, {
            where: {
              id: In(fileAttachments.map((attachment) => attachment.id)),
            },
            select: ['id'],
          })
        : [];

    const validFileIds = new Set(validFiles.map((file) => file.id));

    const parts = [
      {
        messageId: savedMessageId,
        orderIndex: 0,
        type: 'text',
        textContent: text,
      },
      ...(fileAttachments ?? [])
        .filter((attachment) => validFileIds.has(attachment.id))
        .map((attachment, index) => ({
          messageId: savedMessageId,
          orderIndex: index + 1,
          type: 'file',
          fileId: attachment.id,
          fileFilename: attachment.filename,
        })),
    ];

    await this.messagePartRepository.insert(workspaceId, parts);

    await this.notifyThreadActivityUpdated({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    return {
      id: savedMessageId,
      ...messageValues,
      workspaceId,
    } as AgentMessageEntity;
  }

  async hasQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return this.messageRepository.existsBy(workspaceId, {
      threadId,
      status: AgentMessageStatus.QUEUED,
    });
  }

  async getQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentMessageEntity[]> {
    return this.messageRepository.find(workspaceId, {
      where: {
        threadId,
        status: AgentMessageStatus.QUEUED,
      },
      order: { createdAt: 'ASC' },
      relations: ['parts', 'parts.file'],
    });
  }

  async findQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<AgentMessageEntity | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: { id: messageId, status: AgentMessageStatus.QUEUED },
    });
  }

  async deleteQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const result = await this.messageRepository.delete(workspaceId, {
      id: messageId,
      status: AgentMessageStatus.QUEUED,
    });

    return (result.affected ?? 0) > 0;
  }

  async deleteMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messageRepository.delete(workspaceId, { id: messageId });
  }

  async promoteQueuedMessage({
    messageId,
    threadId,
    workspaceId,
  }: {
    messageId: string;
    threadId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      threadId,
      agentId: null,
    });

    const savedTurnId = turnInsertResult.identifiers[0].id as string;

    const result = await this.messageRepository.update(
      workspaceId,
      { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
      {
        status: AgentMessageStatus.SENT,
        processedAt: new Date(),
        turnId: savedTurnId,
      },
    );

    if ((result.affected ?? 0) === 0) {
      await this.turnRepository.delete(workspaceId, { id: savedTurnId });

      return null;
    }

    return savedTurnId;
  }

  async resolvePendingQuestion({
    threadId,
    messageId,
    answers,
    streamId,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    answers: AskQuestionAnswer[];
    streamId: string;
    workspaceId: string;
  }): Promise<{
    answerText: string;
    turnId: string | null;
    rollback: { partId: string; previousOutput: Record<string, unknown> };
  }> {
    const message = await this.messageRepository.findOne(workspaceId, {
      where: { id: messageId, threadId },
      relations: ['parts'],
    });

    if (!message) {
      throw new AiException(
        'Question message not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    const pendingPart = (message.parts ?? []).find(
      (part) =>
        part.toolName === ASK_QUESTIONS_TOOL_NAME &&
        (part.toolOutput as { result?: AskQuestionsToolResult } | null)?.result
          ?.status === 'pending',
    );

    if (!pendingPart) {
      throw new AiException(
        'No pending question to answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      );
    }

    const previousOutput =
      (pendingPart.toolOutput as Record<string, unknown> | null) ?? {};
    const previousResult = previousOutput.result as
      | AskQuestionsToolResult
      | undefined;
    const questions = previousResult?.questions ?? [];

    this.validateQuestionAnswers(answers, questions);

    const claim = await this.threadRepository.update(
      workspaceId,
      {
        id: threadId,
        pendingQuestionMessageId: messageId,
        activeStreamId: IsNull(),
      },
      {
        pendingQuestionMessageId: null,
        activeStreamId: streamId,
        lastStreamError: null,
      },
    );

    if ((claim.affected ?? 0) === 0) {
      const adopted = await this.claimOrphanedQuestion({
        threadId,
        messageId,
        streamId,
        workspaceId,
      });

      if (!adopted) {
        throw new AiException(
          'No pending question to answer',
          AiExceptionCode.QUESTION_NOT_PENDING,
        );
      }
    }

    try {
      await this.messagePartRepository.update(
        workspaceId,
        { id: pendingPart.id },
        {
          toolOutput: {
            ...previousOutput,
            success: true,
            message: 'User answered the questions.',
            result: {
              questions,
              status: 'answered',
              answers,
            },
          },
        },
      );
    } catch (error) {
      await this.threadRepository
        .update(
          workspaceId,
          { id: threadId, activeStreamId: streamId },
          { pendingQuestionMessageId: messageId, activeStreamId: null },
        )
        .catch(() => {});
      throw error;
    }

    const answerText = answers
      .map((answer) => {
        const question = questions[answer.questionIndex];
        const value = isNonEmptyString(answer.freeText)
          ? answer.freeText
          : answer.selectedOptionIndices
              .map((optionIndex) => question.options[optionIndex].label)
              .join(', ');
        return `${question.question}\n${value}`;
      })
      .join('\n\n');

    return {
      answerText,
      turnId: message.turnId,
      rollback: { partId: pendingPart.id, previousOutput },
    };
  }

  private async claimOrphanedQuestion({
    threadId,
    messageId,
    streamId,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    streamId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const latestAssistantMessage = await this.messageRepository.findOne(
      workspaceId,
      {
        where: { threadId, role: AgentMessageRole.ASSISTANT },
        order: {
          processedAt: { direction: 'DESC', nulls: 'LAST' },
          createdAt: 'DESC',
          id: 'DESC',
        },
        select: ['id'],
      },
    );

    if (latestAssistantMessage?.id !== messageId) {
      return false;
    }

    const claim = await this.threadRepository.update(
      workspaceId,
      {
        id: threadId,
        pendingQuestionMessageId: IsNull(),
        activeStreamId: IsNull(),
      },
      { activeStreamId: streamId, lastStreamError: null },
    );

    return (claim.affected ?? 0) > 0;
  }

  async restorePendingQuestion({
    threadId,
    messageId,
    streamId,
    workspaceId,
    rollback,
  }: {
    threadId: string;
    messageId: string;
    streamId: string;
    workspaceId: string;
    rollback: { partId: string; previousOutput: Record<string, unknown> };
  }): Promise<void> {
    await this.messagePartRepository
      .update(
        workspaceId,
        { id: rollback.partId },
        { toolOutput: rollback.previousOutput },
      )
      .catch(() => {});

    await this.threadRepository
      .update(
        workspaceId,
        { id: threadId, activeStreamId: streamId },
        { pendingQuestionMessageId: messageId, activeStreamId: null },
      )
      .catch(() => {});
  }

  private validateQuestionAnswers(
    answers: AskQuestionAnswer[],
    questions: AskQuestionItem[],
  ): void {
    for (const answer of answers) {
      const question = questions[answer.questionIndex];

      if (!isDefined(question)) {
        throw new AiException(
          'Answer references an unknown question.',
          AiExceptionCode.INVALID_QUESTION_ANSWER,
        );
      }

      const hasInvalidOption = answer.selectedOptionIndices.some(
        (optionIndex) =>
          optionIndex < 0 || optionIndex >= question.options.length,
      );

      if (hasInvalidOption) {
        throw new AiException(
          'Answer references an unknown option.',
          AiExceptionCode.INVALID_QUESTION_ANSWER,
        );
      }

      if (
        question.allowMultiSelect !== true &&
        answer.selectedOptionIndices.length > 1
      ) {
        throw new AiException(
          'This question allows only one selection.',
          AiExceptionCode.INVALID_QUESTION_ANSWER,
        );
      }
    }
  }

  async updateThreadTitle({
    threadId,
    userWorkspaceId,
    workspaceId,
    title,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
    title: string;
  }): Promise<AgentChatThreadEntity> {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new AiException(
        'Chat thread title cannot be empty',
        AiExceptionCode.INVALID_CHAT_THREAD_TITLE,
      );
    }

    const updated = await this.sharingService.updateThreadWithAccess({
      threadId,
      userWorkspaceId,
      workspaceId,
      operationType: 'update',
      changes: { title: trimmed },
    });

    await this.broadcastThreadUpdated(updated, ['title'], userWorkspaceId);

    return updated;
  }

  async archiveThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      userWorkspaceId,
      workspaceId,
      operationType: 'soft-delete',
      changes: { deletedAt: new Date(), activeStreamId: null },
    });

    await this.broadcastThreadUpdated(thread, ['deletedAt'], userWorkspaceId);

    this.releaseThreadSandboxBestEffort(workspaceId, threadId);

    return thread;
  }

  async unarchiveThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      userWorkspaceId,
      workspaceId,
      operationType: 'restore',
      changes: { deletedAt: null },
    });

    await this.broadcastThreadUpdated(thread, ['deletedAt'], userWorkspaceId);

    return thread;
  }

  async hardDeleteThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.sharingService.getThreadWithAccess({
      threadId,
      userWorkspaceId,
      workspaceId,
      operationType: 'delete',
    });

    const deleted = await this.sharingService.deleteThreadWithShares({
      workspaceId,
      threadId,
      userWorkspaceId,
    });

    if (!deleted) {
      this.logger.warn(
        `hardDeleteThread: thread ${threadId} vanished between fetch and delete`,
      );
      return;
    }

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'deleted',
          entityName: 'agentChatThread',
          recordId: threadId,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            before: serializeAgentChatThreadForBroadcast({
              thread,
              lastMessageAt: null,
            }),
          },
        },
      ],
    });

    this.releaseThreadSandboxBestEffort(workspaceId, threadId);
  }

  private releaseThreadSandboxBestEffort(
    workspaceId: string,
    threadId: string,
  ): void {
    void this.codeInterpreterService
      .releaseThreadSandbox(workspaceId, threadId)
      .catch((error) =>
        this.logger.warn(
          `Failed to release code interpreter sandbox for thread ${threadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
  }

  async notifyThreadActivityUpdated({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(
      thread,
      ['lastMessageAt'],
      userWorkspaceId,
    );
  }

  async notifyThreadUsageUpdated({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(
      thread,
      [
        'totalInputTokens',
        'totalOutputTokens',
        'totalInputCredits',
        'totalOutputCredits',
        'conversationSize',
        'contextWindowTokens',
      ],
      userWorkspaceId,
    );
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadEntity,
    updatedFields: (keyof AgentChatThreadDTO)[],
    userWorkspaceId: string,
  ): Promise<void> {
    const permissions = await this.sharingService.getPermissions({
      workspaceId: thread.workspaceId,
      userWorkspaceId,
      threadId: thread.id,
    });
    if (!permissions.canRead) {
      return;
    }
    const lastMessageAt = await this.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            updatedFields,
            after: serializeAgentChatThreadForBroadcast({
              thread,
              lastMessageAt,
            }),
          },
        },
      ],
    });
  }

  async generateTitleIfNeeded({
    threadId,
    messageContent,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!thread || thread.title || !messageContent) {
      return null;
    }

    const title = await this.titleGenerationService.generateThreadTitle(
      messageContent,
      workspaceId,
      userWorkspaceId,
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title },
    );

    await this.broadcastThreadUpdated(
      { ...thread, title },
      ['title'],
      thread.userWorkspaceId,
    );

    return title;
  }
}
