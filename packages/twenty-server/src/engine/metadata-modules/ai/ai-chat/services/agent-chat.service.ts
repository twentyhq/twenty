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

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentChatThreadDTO } from '../dtos/agent-chat-thread.dto';

type PendingQuestionRollback = {
  partId: string;
  previousOutput: Record<string, unknown> & { result?: AskQuestionsToolResult };
};

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async createThread({
    workspaceMemberId,
    workspaceId,
    id,
    title,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
    id?: string;
    title?: string;
  }) {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const savedThread = await this.sharingService.createThread({
      workspaceId,
      workspaceMemberId,
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
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
          properties: {
            after: serializeAgentChatThreadForBroadcast({
              thread: savedThread,
              lastMessageAt: null,
            }),
          },
        },
      ],
    });

    await this.threadRecordEventService.emitThreadCreated({
      workspaceId,
      threadId: savedThread.id,
    });

    return savedThread;
  }

  async findWritableThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    try {
      return await this.sharingService.getThreadWithAccess({
        threadId,
        workspaceMemberId,
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

  async getWritableThread(args: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    return this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });
  }

  async getThreadsForMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<
    (AgentChatThreadWorkspaceEntity & { lastMessageAt: Date | null })[]
  > {
    const readableThreadIds = await this.sharingService.getReadableThreadIds({
      workspaceId,
      workspaceMemberId,
    });
    const rankedThreads = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ id: string; last_message_at: Date | null }[]>(
          `SELECT thread.id, MAX(message."createdAt") AS last_message_at
       FROM ${table('agentChatThread')} thread
       LEFT JOIN ${table('agentMessage')} message ON message."threadId" = thread.id AND message."isHidden" = false
       WHERE thread.id = ANY($1::uuid[])
       GROUP BY thread.id ORDER BY last_message_at DESC NULLS LAST, thread."updatedAt" DESC`,
          [readableThreadIds],
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

    const threadById = new Map(threads.map((thread) => [thread.id, thread]));

    return rankedThreads.flatMap((rankedThread) => {
      const thread = threadById.get(rankedThread.id);

      return isDefined(thread)
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
      ({ manager, table }) =>
        manager.query<{ last_message_at: Date | null }[]>(
          `SELECT MAX("createdAt") AS last_message_at FROM ${table('agentMessage')}
       WHERE "threadId" = $1 AND "isHidden" = false`,
          [threadId],
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
      processedAt: (processedAt ?? new Date()).toISOString(),
      ...this.getMessageSenderValues({ workspaceId, userWorkspaceId }),
      ...(isDefined(isHidden) ? { isHidden } : {}),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToPersistedDBParts(
        uiMessage.parts,
        savedMessageId,
        workspaceId,
      );

      if (dbParts.length > 0) {
        await this.messagePartRepository.insert(
          workspaceId,
          dbParts as QueryDeepPartialEntity<AgentMessagePartWorkspaceEntity>[],
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
    };
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
        processedAt: new Date().toISOString(),
      },
      ['id'],
    );

    await this.messagePartRepository.delete(workspaceId, { messageId: id });

    const dbParts = mapUIMessagePartsToPersistedDBParts(parts, id, workspaceId);

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartWorkspaceEntity>[],
      );
    }
  }

  async findLatestSentUserMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<Pick<AgentMessageWorkspaceEntity, 'id' | 'turnId'> | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: {
        threadId,
        role: AgentMessageRole.USER,
        status: AgentMessageStatus.SENT,
      },
      order: {
        processedAt: { order: 'DESC', nulls: 'NULLS LAST' },
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
    workspaceMemberId,
    workspaceId,
    includeHidden = false,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    includeHidden?: boolean;
  }) {
    if (includeHidden) {
      await this.getWritableThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      });
    } else {
      await this.sharingService.getReadableThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      });
    }

    return this.messageRepository.find(workspaceId, {
      where: { threadId, ...(includeHidden ? {} : { isHidden: false }) },
      order: { processedAt: { order: 'ASC', nulls: 'NULLS LAST' } },
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
    workspaceMemberId,
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileAttachments?: AiChatFileAttachment[];
    workspaceId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
  }) {
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
      workspaceMemberId,
      workspaceId,
    });

    return {
      id: savedMessageId,
      ...messageValues,
    };
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
  }): Promise<AgentMessageWorkspaceEntity[]> {
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
  }): Promise<AgentMessageWorkspaceEntity | null> {
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
        processedAt: new Date().toISOString(),
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
    // Null for a conversation no chat stream continues, such as a workflow
    // run's: its question is claimed by its marker alone.
    streamId: string | null;
    workspaceId: string;
  }): Promise<{
    answerText: string;
    toolCallId: string | null;
    turnId: string | null;
    rollback: PendingQuestionRollback;
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
      (pendingPart.toolOutput as
        | PendingQuestionRollback['previousOutput']
        | null) ?? {};
    const questions = previousOutput.result?.questions ?? [];

    this.validateQuestionAnswers(answers, questions);

    const isClaimed = isDefined(streamId)
      ? await this.claimQuestionForStream({
          threadId,
          messageId,
          streamId,
          workspaceId,
        })
      : await this.claimQuestionMarker({ threadId, messageId, workspaceId });

    if (!isClaimed) {
      throw new AiException(
        'No pending question to answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      );
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
      await this.releaseQuestionClaim({
        threadId,
        messageId,
        streamId,
        workspaceId,
      });
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
      toolCallId: pendingPart.toolCallId,
      turnId: message.turnId,
      rollback: { partId: pendingPart.id, previousOutput },
    };
  }

  private async claimQuestionForStream({
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

    if ((claim.affected ?? 0) > 0) {
      return true;
    }

    return this.claimOrphanedQuestion({
      threadId,
      messageId,
      streamId,
      workspaceId,
    });
  }

  // Clearing the marker is the claim: of two concurrent answers only one
  // matches it. No orphan is adopted here, since without a stream an orphaned
  // question cannot be told apart from one another answer has just claimed.
  private async claimQuestionMarker({
    threadId,
    messageId,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, pendingQuestionMessageId: messageId },
      { pendingQuestionMessageId: null },
    );

    return (claim.affected ?? 0) > 0;
  }

  private async releaseQuestionClaim({
    threadId,
    messageId,
    streamId,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    streamId: string | null;
    workspaceId: string;
  }): Promise<void> {
    const release = isDefined(streamId)
      ? this.threadRepository.update(
          workspaceId,
          { id: threadId, activeStreamId: streamId },
          { pendingQuestionMessageId: messageId, activeStreamId: null },
        )
      : this.threadRepository.update(
          workspaceId,
          { id: threadId, pendingQuestionMessageId: IsNull() },
          { pendingQuestionMessageId: messageId },
        );

    await release.catch(() => {});
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
          processedAt: { order: 'DESC', nulls: 'NULLS LAST' },
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
    streamId: string | null;
    workspaceId: string;
    rollback: PendingQuestionRollback;
  }): Promise<void> {
    await this.messagePartRepository
      .update(
        workspaceId,
        { id: rollback.partId },
        { toolOutput: rollback.previousOutput },
      )
      .catch(() => {});

    await this.releaseQuestionClaim({
      threadId,
      messageId,
      streamId,
      workspaceId,
    });
  }

  // For a question nothing can consume any more: its run ended, or the step
  // moved on to another conversation. Restoring it would leave a card that
  // every answer is refused on, so it is closed instead. An ending run closes
  // its questions itself; this covers an answer that claimed one just before.
  async closePendingQuestion({
    workspaceId,
    rollback,
  }: {
    workspaceId: string;
    rollback: PendingQuestionRollback;
  }): Promise<void> {
    await this.messagePartRepository
      .update(
        workspaceId,
        { id: rollback.partId },
        {
          toolOutput: {
            ...rollback.previousOutput,
            result: { ...rollback.previousOutput.result, status: 'skipped' },
          },
        },
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
    workspaceMemberId,
    workspaceId,
    title,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    title: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new AiException(
        'Chat thread title cannot be empty',
        AiExceptionCode.INVALID_CHAT_THREAD_TITLE,
      );
    }

    const threadBefore = await this.findThreadForRecordEvent({
      workspaceId,
      threadId,
    });
    const updated = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'update',
      changes: { title: trimmed },
    });

    await this.broadcastThreadUpdated(
      updated,
      workspaceId,
      ['title'],
      workspaceMemberId,
    );
    if (isDefined(threadBefore)) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
      });
    }

    return updated;
  }

  async archiveThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const threadBefore = await this.findThreadForRecordEvent({
      workspaceId,
      threadId,
    });
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'soft-delete',
      changes: { archivedAt: new Date(), activeStreamId: null },
    });

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      ['deletedAt'],
      workspaceMemberId,
    );
    if (isDefined(threadBefore)) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
      });
    }

    this.threadLifecycleService.releaseThreadSandboxBestEffort({
      workspaceId,
      threadId,
    });

    return thread;
  }

  async unarchiveThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const threadBefore = await this.findThreadForRecordEvent({
      workspaceId,
      threadId,
    });
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'restore',
      changes: { archivedAt: null },
    });

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      ['deletedAt'],
      workspaceMemberId,
    );
    if (isDefined(threadBefore)) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
      });
    }

    return thread;
  }

  async hardDeleteThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const thread = await this.sharingService.getThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'delete',
    });

    const deleted = await this.sharingService.deleteThreadWithAccess({
      workspaceId,
      threadId,
      workspaceMemberId,
    });

    if (!deleted) {
      this.logger.warn(
        `hardDeleteThread: thread ${threadId} vanished between fetch and delete`,
      );
      return;
    }

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'deleted',
          entityName: 'agentChatThread',
          recordId: threadId,
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
          properties: {
            before: serializeAgentChatThreadForBroadcast({
              thread,
              lastMessageAt: null,
            }),
          },
        },
      ],
    });
    await this.threadRecordEventService.emitThreadDestroyed({
      workspaceId,
      threadBefore: thread,
    });

    this.threadLifecycleService.releaseThreadSandboxBestEffort({
      workspaceId,
      threadId,
    });
  }

  async cancelActiveStreamIfAny({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.threadLifecycleService.cancelActiveStreamIfAny({
      workspaceId,
      threadId,
    });
  }

  // Access-checked writes return raw rows; record events carry ORM records
  private findThreadForRecordEvent({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity | null> {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
  }

  async notifyThreadActivityUpdated({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    const threadAfter = { ...thread, updatedAt: new Date().toISOString() };

    // Conversations are listed by most recent change, so a message moves its
    // conversation to the top when it is sent, not only once the turn ends.
    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { updatedAt: threadAfter.updatedAt },
    );

    await this.broadcastThreadUpdated(
      threadAfter,
      workspaceId,
      ['lastMessageAt'],
      workspaceMemberId,
    );
    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
      threadAfter,
    });
  }

  async notifyThreadUsageUpdated({
    threadBefore,
    workspaceMemberId,
    workspaceId,
  }: {
    threadBefore: AgentChatThreadWorkspaceEntity;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const threadId = threadBefore.id;
    const thread = await this.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      [
        'totalInputTokens',
        'totalOutputTokens',
        'totalInputCredits',
        'totalOutputCredits',
        'conversationSize',
        'contextWindowTokens',
      ],
      workspaceMemberId,
    );
    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore,
      threadAfter: thread,
    });
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadWorkspaceEntity,
    workspaceId: string,
    updatedFields: (keyof AgentChatThreadDTO)[],
    workspaceMemberId: string,
  ): Promise<void> {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const permissions = await this.sharingService.getPermissions({
      workspaceId,
      workspaceMemberId,
      threadId: thread.id,
    });
    if (!permissions.canRead) {
      return;
    }
    const lastMessageAt = await this.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
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
    workspaceMemberId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!thread || thread.title || !messageContent) {
      return null;
    }

    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const title = await this.titleGenerationService.generateThreadTitle(
      messageContent,
      workspaceId,
      authContext.userWorkspaceId,
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title },
    );

    await this.broadcastThreadUpdated(
      { ...thread, title },
      workspaceId,
      ['title'],
      workspaceMemberId,
    );
    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
    });

    return title;
  }
}
