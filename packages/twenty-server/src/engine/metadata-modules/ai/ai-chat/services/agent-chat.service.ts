import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionAnswer,
  type AskQuestionItem,
  type AskQuestionsToolResult,
  ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, In, IsNull, Not } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { AgentChatChannelMemberEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel-member.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { AgentChatThreadParticipantEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-participant.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';
import { buildThreadAccessWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-access-where.util';
import { isForeignKeyViolation } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-foreign-key-violation.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { type AgentChatThreadLastMessageSummary } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-message-summary.type';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentChatThreadDTO } from '../dtos/agent-chat-thread.dto';

const LAST_MESSAGE_PREVIEW_MAX_LENGTH = 200;

const EMPTY_LAST_MESSAGE_SUMMARY: AgentChatThreadLastMessageSummary = {
  lastMessageAt: null,
  lastMessagePreview: null,
  lastMessageRole: null,
  lastMessageAuthorUserWorkspaceId: null,
};

const toLastMessagePreview = (text: string | null): string | null => {
  const normalized = text?.replace(/\s+/g, ' ').trim() ?? '';

  if (normalized.length === 0) {
    return null;
  }

  return normalized.length > LAST_MESSAGE_PREVIEW_MAX_LENGTH
    ? `${normalized.slice(0, LAST_MESSAGE_PREVIEW_MAX_LENGTH - 1)}…`
    : normalized;
};

const serializeThreadForBroadcast = (
  thread: AgentChatThreadEntity,
  lastMessageSummary: AgentChatThreadLastMessageSummary,
) => ({
  id: thread.id,
  title: thread.title,
  channelId: thread.channelId,
  ownerUserWorkspaceId: thread.userWorkspaceId,
  workflowRunId: thread.workflowRunId,
  workflowStepId: thread.workflowStepId,
  totalInputTokens: thread.totalInputTokens,
  totalOutputTokens: thread.totalOutputTokens,
  totalCacheReadTokens: thread.totalCacheReadTokens,
  totalCacheCreationTokens: thread.totalCacheCreationTokens,
  contextWindowTokens: thread.contextWindowTokens,
  conversationSize: thread.conversationSize,
  totalInputCredits: toDisplayCredits(thread.totalInputCredits),
  totalOutputCredits: toDisplayCredits(thread.totalOutputCredits),
  deletedAt: thread.deletedAt,
  ...lastMessageSummary,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(AgentTurnEntity)
    private readonly turnRepository: WorkspaceScopedRepository<AgentTurnEntity>,
    @InjectWorkspaceScopedRepository(AgentMessageEntity)
    private readonly messageRepository: WorkspaceScopedRepository<AgentMessageEntity>,
    @InjectWorkspaceScopedRepository(AgentMessagePartEntity)
    private readonly messagePartRepository: WorkspaceScopedRepository<AgentMessagePartEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly codeInterpreterService: CodeInterpreterService,
    @InjectWorkspaceScopedRepository(AgentChatThreadParticipantEntity)
    private readonly participantRepository: WorkspaceScopedRepository<AgentChatThreadParticipantEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelMemberEntity)
    private readonly channelMemberRepository: WorkspaceScopedRepository<AgentChatChannelMemberEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelRoleEntity)
    private readonly channelRoleRepository: WorkspaceScopedRepository<AgentChatChannelRoleEntity>,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectWorkspaceScopedRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: WorkspaceScopedRepository<UserWorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async createThread({
    userWorkspaceId,
    workspaceId,
    id,
    title,
    channelId,
    workflowRun,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    id?: string;
    title?: string;
    // Access to the channel is the caller's responsibility to check.
    channelId?: string | null;
    workflowRun?: { workflowRunId: string; workflowStepId: string };
  }) {
    // The owner row is what grants access, so a thread must never exist
    // without it: both rows land in one transaction.
    const savedThread = await this.coreDataSource
      .transaction(async (entityManager) => {
        const thread = await this.threadRepository
          .withManager(entityManager)
          .insertAndReturnOne(workspaceId, {
            ...(isDefined(id) ? { id } : {}),
            ...(isDefined(title) ? { title } : {}),
            ...(isDefined(channelId) ? { channelId } : {}),
            ...(isDefined(workflowRun)
              ? {
                  workflowRunId: workflowRun.workflowRunId,
                  workflowStepId: workflowRun.workflowStepId,
                }
              : {}),
            userWorkspaceId,
          });

        await this.participantRepository
          .withManager(entityManager)
          .insert(workspaceId, {
            threadId: thread.id,
            userWorkspaceId,
            role: AgentChatThreadParticipantRole.OWNER,
          });

        return thread;
      })
      .catch((error: unknown) => {
        // The channel can be deleted between the caller's access check and
        // this insert; the foreign key then reports it as gone.
        if (isDefined(channelId) && isForeignKeyViolation(error)) {
          throw new AiException(
            'Channel not found',
            AiExceptionCode.CHANNEL_NOT_FOUND,
          );
        }

        throw error;
      });

    await this.broadcastThreadCreatedToRecipients({
      thread: savedThread,
      recipientUserWorkspaceIds: isDefined(channelId)
        ? await this.getThreadRecipientUserWorkspaceIds({
            threadId: savedThread.id,
            workspaceId,
          })
        : [userWorkspaceId],
    });

    return savedThread;
  }

  async broadcastThreadCreatedToRecipients({
    thread,
    recipientUserWorkspaceIds,
  }: {
    thread: AgentChatThreadEntity;
    recipientUserWorkspaceIds: string[] | undefined;
  }): Promise<void> {
    const lastMessageSummary = await this.getLastMessageSummaryForThread({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'created',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds,
          properties: {
            after: serializeThreadForBroadcast(thread, lastMessageSummary),
          },
        },
      ],
    });
  }

  async broadcastThreadDeletedToRecipients({
    thread,
    recipientUserWorkspaceIds,
  }: {
    thread: AgentChatThreadEntity;
    recipientUserWorkspaceIds: string[] | undefined;
  }): Promise<void> {
    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'deleted',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds,
          properties: {
            before: serializeThreadForBroadcast(
              thread,
              EMPTY_LAST_MESSAGE_SUMMARY,
            ),
          },
        },
      ],
    });
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
    return this.threadRepository.findOne(workspaceId, {
      where: buildThreadAccessWhere({ id: threadId, userWorkspaceId }),
    });
  }

  // Readers of a thread: its participants plus the members of its channel.
  // Undefined means everyone in the workspace, which is what a public
  // channel grants and what the broadcaster treats as workspace-wide.
  async getThreadRecipientUserWorkspaceIds({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<string[] | undefined> {
    const [thread, participantUserWorkspaceIds] = await Promise.all([
      this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
        select: ['id', 'channelId'],
      }),
      this.getParticipantUserWorkspaceIds({ threadId, workspaceId }),
    ]);

    if (!isDefined(thread?.channelId)) {
      return participantUserWorkspaceIds;
    }

    const channel = await this.channelRepository.findOne(workspaceId, {
      where: { id: thread.channelId },
      select: ['id', 'visibility'],
    });

    if (channel?.visibility === AgentChatChannelVisibility.PUBLIC) {
      return undefined;
    }

    const channelReaderUserWorkspaceIds =
      await this.getChannelReaderUserWorkspaceIds({
        channelId: thread.channelId,
        workspaceId,
      });

    return [
      ...new Set([
        ...participantUserWorkspaceIds,
        ...channelReaderUserWorkspaceIds,
      ]),
    ];
  }

  async getWorkspaceUserWorkspaceIds(workspaceId: string): Promise<string[]> {
    const userWorkspaces = await this.userWorkspaceRepository.find(
      workspaceId,
      { select: ['id'] },
    );

    return userWorkspaces.map((userWorkspace) => userWorkspace.id);
  }

  // Everyone who reads a channel without being public: its members plus the
  // users holding one of its roles.
  async getChannelReaderUserWorkspaceIds({
    channelId,
    workspaceId,
  }: {
    channelId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const [members, channelRoles] = await Promise.all([
      this.channelMemberRepository.find(workspaceId, {
        where: { channelId },
        select: ['userWorkspaceId'],
      }),
      this.channelRoleRepository.find(workspaceId, {
        where: { channelId },
        select: ['roleId'],
      }),
    ]);

    const roleTargets =
      channelRoles.length > 0
        ? await this.roleTargetRepository.find(workspaceId, {
            where: {
              roleId: In(channelRoles.map((channelRole) => channelRole.roleId)),
              userWorkspaceId: Not(IsNull()),
            },
            select: ['userWorkspaceId'],
          })
        : [];

    return [
      ...new Set([
        ...members.map((member) => member.userWorkspaceId),
        ...roleTargets.flatMap((roleTarget) =>
          isDefined(roleTarget.userWorkspaceId)
            ? [roleTarget.userWorkspaceId]
            : [],
        ),
      ]),
    ];
  }

  // Tells every stream what changed for it when a thread's readers change:
  // new readers get a created event, lost readers a deleted one, and the
  // rest an update carrying the fields that changed.
  async broadcastThreadAccessChange({
    thread,
    recipientsBefore,
    recipientsAfter,
    updatedFields,
  }: {
    thread: AgentChatThreadEntity;
    recipientsBefore: string[] | undefined;
    recipientsAfter: string[] | undefined;
    updatedFields: (keyof AgentChatThreadDTO)[];
  }): Promise<void> {
    if (!isDefined(recipientsAfter)) {
      await this.broadcastThreadUpdated(thread, updatedFields, {
        userWorkspaceIds: undefined,
      });

      return;
    }

    // The thread was readable by the whole workspace and now is not, so the
    // readers it loses are everyone outside the new set. Telling the whole
    // workspace it was deleted would take it from the readers who keep it and
    // hand it back a moment later.
    if (!isDefined(recipientsBefore)) {
      const workspaceUserWorkspaceIds = await this.getWorkspaceUserWorkspaceIds(
        thread.workspaceId,
      );
      const keptRecipients = new Set(recipientsAfter);
      const losingRecipients = workspaceUserWorkspaceIds.filter(
        (userWorkspaceId) => !keptRecipients.has(userWorkspaceId),
      );

      if (losingRecipients.length > 0) {
        await this.broadcastThreadDeletedToRecipients({
          thread,
          recipientUserWorkspaceIds: losingRecipients,
        });
      }

      await this.broadcastThreadCreatedToRecipients({
        thread,
        recipientUserWorkspaceIds: recipientsAfter,
      });

      return;
    }

    const before = new Set(recipientsBefore);
    const after = new Set(recipientsAfter);
    const added = recipientsAfter.filter((id) => !before.has(id));
    const removed = recipientsBefore.filter((id) => !after.has(id));
    const kept = recipientsAfter.filter((id) => before.has(id));

    if (added.length > 0) {
      await this.broadcastThreadCreatedToRecipients({
        thread,
        recipientUserWorkspaceIds: added,
      });
    }

    // Readers who keep the thread only hear about it when one of its own
    // fields changed; a pure audience change is nothing for them to apply.
    if (kept.length > 0 && updatedFields.length > 0) {
      await this.broadcastThreadUpdated(thread, updatedFields, {
        userWorkspaceIds: kept,
      });
    }

    if (removed.length > 0) {
      await this.broadcastThreadDeletedToRecipients({
        thread,
        recipientUserWorkspaceIds: removed,
      });
    }
  }

  async assertThreadOwner({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const isOwner = await this.participantRepository.existsBy(workspaceId, {
      threadId,
      userWorkspaceId,
      role: AgentChatThreadParticipantRole.OWNER,
    });

    if (!isOwner) {
      throw new AiException(
        'Only the thread owner can do this',
        AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
      );
    }
  }

  async getParticipantUserWorkspaceIds({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const participants = await this.participantRepository.find(workspaceId, {
      where: { threadId },
      select: ['userWorkspaceId'],
    });

    return participants.map((participant) => participant.userWorkspaceId);
  }

  async getParticipantUserWorkspaceIdsByThreadId({
    threadIds,
    workspaceId,
  }: {
    threadIds: string[];
    workspaceId: string;
  }): Promise<Map<string, string[]>> {
    const participantUserWorkspaceIdsByThreadId = new Map<string, string[]>(
      threadIds.map((threadId) => [threadId, []]),
    );

    if (threadIds.length === 0) {
      return participantUserWorkspaceIdsByThreadId;
    }

    const participants = await this.participantRepository.find(workspaceId, {
      where: { threadId: In(threadIds) },
      select: ['threadId', 'userWorkspaceId'],
    });

    for (const participant of participants) {
      participantUserWorkspaceIdsByThreadId
        .get(participant.threadId)
        ?.push(participant.userWorkspaceId);
    }

    return participantUserWorkspaceIdsByThreadId;
  }

  async getThreadById({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const thread = await this.findThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return thread;
  }

  async getThreadsForUser({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<(AgentChatThreadEntity & AgentChatThreadLastMessageSummary)[]> {
    const rankedThreads = await this.threadRepository
      .createQueryBuilder('thread')
      .select('thread.id', 'id')
      .addSelect('MAX(message.createdAt)', 'last_message_at')
      .leftJoin('thread.messages', 'message', 'message.isHidden = false')
      .leftJoin(
        'thread.participants',
        'participant',
        'participant.userWorkspaceId = :userWorkspaceId',
        { userWorkspaceId },
      )
      .leftJoin('thread.channel', 'channel')
      .leftJoin(
        'channel.members',
        'channelMember',
        'channelMember.userWorkspaceId = :userWorkspaceId',
        { userWorkspaceId },
      )
      .leftJoin('channel.roles', 'channelRole')
      .leftJoin(
        RoleTargetEntity,
        'channelRoleTarget',
        'channelRoleTarget.roleId = channelRole.roleId AND channelRoleTarget.userWorkspaceId = :userWorkspaceId',
        { userWorkspaceId },
      )
      .where('thread.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        '(participant.id IS NOT NULL OR channelMember.id IS NOT NULL OR channelRoleTarget.id IS NOT NULL OR channel.visibility = :publicVisibility)',
        { publicVisibility: AgentChatChannelVisibility.PUBLIC },
      )
      .groupBy('thread.id')
      .orderBy('last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('thread.updatedAt', 'DESC')
      .getRawMany<{ id: string; last_message_at: Date | null }>();

    if (rankedThreads.length === 0) {
      return [];
    }

    const rankedThreadIds = rankedThreads.map(
      (rankedThread) => rankedThread.id,
    );

    const [threads, lastMessageSummaryByThreadId] = await Promise.all([
      this.threadRepository.find(workspaceId, {
        where: { id: In(rankedThreadIds) },
      }),
      this.getLastMessageSummaryByThreadId({
        threadIds: rankedThreadIds,
        workspaceId,
      }),
    ]);

    const threadById = new Map(threads.map((thread) => [thread.id, thread]));

    return rankedThreads.flatMap((rankedThread) => {
      const thread = threadById.get(rankedThread.id);

      return thread
        ? [
            {
              ...thread,
              ...(lastMessageSummaryByThreadId.get(thread.id) ??
                EMPTY_LAST_MESSAGE_SUMMARY),
            },
          ]
        : [];
    });
  }

  async getLastMessageSummaryForThread({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadLastMessageSummary> {
    const summaryByThreadId = await this.getLastMessageSummaryByThreadId({
      threadIds: [threadId],
      workspaceId,
    });

    return summaryByThreadId.get(threadId) ?? EMPTY_LAST_MESSAGE_SUMMARY;
  }

  // The latest visible message of each thread with its first text part, in
  // one query, so thread lists can show who said what last.
  async getLastMessageSummaryByThreadId({
    threadIds,
    workspaceId,
  }: {
    threadIds: string[];
    workspaceId: string;
  }): Promise<Map<string, AgentChatThreadLastMessageSummary>> {
    if (threadIds.length === 0) {
      return new Map();
    }

    const rows = await this.messageRepository
      .createQueryBuilder('message')
      .distinctOn(['message.threadId'])
      .select('message.threadId', 'threadId')
      .addSelect('message.role', 'role')
      .addSelect('message.authorUserWorkspaceId', 'authorUserWorkspaceId')
      .addSelect('message.createdAt', 'createdAt')
      .addSelect('part.textContent', 'textContent')
      .leftJoin(
        'message.parts',
        'part',
        "part.type = 'text' AND part.textContent IS NOT NULL",
      )
      .where('message.threadId IN (:...threadIds)', { threadIds })
      .andWhere('message.workspaceId = :workspaceId', { workspaceId })
      .andWhere('message.isHidden = false')
      .orderBy('message.threadId')
      .addOrderBy('message.createdAt', 'DESC')
      .addOrderBy('part.orderIndex', 'ASC')
      .getRawMany<{
        threadId: string;
        role: AgentMessageRole;
        authorUserWorkspaceId: string | null;
        createdAt: Date;
        textContent: string | null;
      }>();

    return new Map(
      rows.map((row) => [
        row.threadId,
        {
          lastMessageAt: row.createdAt,
          lastMessagePreview: toLastMessagePreview(row.textContent),
          lastMessageRole: row.role,
          lastMessageAuthorUserWorkspaceId: row.authorUserWorkspaceId,
        },
      ]),
    );
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
    authorUserWorkspaceId,
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
    authorUserWorkspaceId?: string;
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
      authorUserWorkspaceId: authorUserWorkspaceId ?? null,
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
    // getThreadById enforces ownership; messages then scoped by both
    // threadId and workspaceId.
    await this.getThreadById({ threadId, userWorkspaceId, workspaceId });

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
  }: {
    threadId: string;
    workspaceId: string;
    text: string;
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
      authorUserWorkspaceId: userWorkspaceId,
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
      { id: threadId, pendingQuestionMessageId: messageId },
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

    return {
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

    await this.getThreadById({ threadId, userWorkspaceId, workspaceId });

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title: trimmed },
    );

    const updated = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(updated, ['title']);

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
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (thread.deletedAt) {
      return thread;
    }

    await this.assertThreadOwner({ threadId, userWorkspaceId, workspaceId });

    const deletedAt = new Date();

    const result = await this.threadRepository.update(
      workspaceId,
      { id: threadId, deletedAt: IsNull() },
      { deletedAt, activeStreamId: null },
    );

    if ((result.affected ?? 0) === 0) {
      return thread;
    }

    thread.deletedAt = deletedAt;
    thread.activeStreamId = null;

    await this.broadcastThreadUpdated(thread, ['deletedAt']);

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
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (!thread.deletedAt) {
      return thread;
    }

    const result = await this.threadRepository.update(
      workspaceId,
      { id: threadId, deletedAt: Not(IsNull()) },
      { deletedAt: null },
    );

    if ((result.affected ?? 0) === 0) {
      return thread;
    }

    thread.deletedAt = null;

    await this.broadcastThreadUpdated(thread, ['deletedAt']);

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
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.assertThreadOwner({ threadId, userWorkspaceId, workspaceId });

    // Participants cascade away with the thread, so collect recipients first.
    const recipientUserWorkspaceIds =
      await this.getThreadRecipientUserWorkspaceIds({ threadId, workspaceId });

    const result = await this.threadRepository.delete(workspaceId, {
      id: threadId,
    });

    if ((result.affected ?? 0) === 0) {
      this.logger.warn(
        `hardDeleteThread: thread ${threadId} vanished between fetch and delete`,
      );

      return;
    }

    await this.broadcastThreadDeletedToRecipients({
      thread,
      recipientUserWorkspaceIds,
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

    await this.broadcastThreadUpdated(thread, ['lastMessageAt']);
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

    await this.broadcastThreadUpdated(thread, [
      'totalInputTokens',
      'totalOutputTokens',
      'totalInputCredits',
      'totalOutputCredits',
      'conversationSize',
      'contextWindowTokens',
    ]);
  }

  // For writers outside the chat flow (a workflow job, for one) that changed
  // a thread and want its readers told.
  async broadcastThreadChanged({
    threadId,
    workspaceId,
    updatedFields,
  }: {
    threadId: string;
    workspaceId: string;
    updatedFields: (keyof AgentChatThreadDTO)[];
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(thread)) {
      return;
    }

    await this.broadcastThreadUpdated(thread, updatedFields);
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadEntity,
    updatedFields: (keyof AgentChatThreadDTO)[],
    recipients?: { userWorkspaceIds: string[] | undefined },
  ): Promise<void> {
    const [lastMessageSummary, recipientUserWorkspaceIds] = await Promise.all([
      this.getLastMessageSummaryForThread({
        threadId: thread.id,
        workspaceId: thread.workspaceId,
      }),
      isDefined(recipients)
        ? Promise.resolve(recipients.userWorkspaceIds)
        : this.getThreadRecipientUserWorkspaceIds({
            threadId: thread.id,
            workspaceId: thread.workspaceId,
          }),
    ]);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds,
          properties: {
            updatedFields,
            after: serializeThreadForBroadcast(thread, lastMessageSummary),
          },
        },
      ],
    });
  }

  async generateTitleIfNeeded({
    threadId,
    messageContent,
    workspaceId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
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
      thread.userWorkspaceId,
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title },
    );

    await this.broadcastThreadUpdated({ ...thread, title }, ['title']);

    return title;
  }
}
