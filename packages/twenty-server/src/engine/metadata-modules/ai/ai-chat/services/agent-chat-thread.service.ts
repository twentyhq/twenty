import { Injectable, Logger } from '@nestjs/common';

import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatAssistantParticipationArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation-args.type';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatThreadCreationArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-creation-args.type';
import { type AgentChatThreadCreationResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-creation-result.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatThreadService {
  private readonly logger = new Logger(AgentChatThreadService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly channelGrantService: AgentChatChannelGrantService,
    private readonly assistantParticipationService: AgentChatAssistantParticipationService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
  ) {}

  async createThread(
    args: AgentChatThreadCreationArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    return (await this.createThreadWithParticipation(args)).thread;
  }

  private async createThreadWithParticipation({
    isAssistantMentioned,
    isInitialAssistantParticipant,
    recipientWorkspaceMemberIds,
    mentionedWorkspaceMemberIds,
    shouldApplyAssistantParticipation = true,
    shouldValidateRecipients = false,
    isReplyRequested,
    ...args
  }: AgentChatThreadCreationArgs): Promise<AgentChatThreadCreationResult> {
    if (isDefined(args.channelId)) {
      await this.channelAccessService.assertChannelAccess({
        workspaceId: args.workspaceId,
        workspaceMemberId: args.workspaceMemberId,
        channelId: args.channelId,
      });
    }

    const assistantParticipationInput = {
      workspaceId: args.workspaceId,
      workspaceMemberId: args.workspaceMemberId,
      isAssistantMentioned,
      isInitialAssistantParticipant,
      recipientWorkspaceMemberIds,
      mentionedWorkspaceMemberIds,
      isReplyRequested,
    };
    let participation: AgentChatAssistantParticipation | undefined;
    const createdThread = await this.sharingService.createThread({
      ...args,
      validateThread: shouldValidateRecipients
        ? async ({ thread, transactionScope }) => {
            participation =
              await this.assistantParticipationService.resolveAssistantParticipation(
                {
                  ...assistantParticipationInput,
                  thread,
                  transactionScope,
                  isInitialMessage: true,
                  isUncommittedThread: true,
                },
              );
          }
        : undefined,
    });
    const savedThread = await this.reconcileInitialAssistantParticipation({
      ...assistantParticipationInput,
      thread: createdThread,
      shouldApplyAssistantParticipation,
      participation,
    });

    // Sent first, so the new thread never shows as unread to its owner
    await this.participantService.emitParticipantCreated({
      workspaceId: args.workspaceId,
      workspaceMemberId: args.workspaceMemberId,
      threadId: savedThread.id,
    });

    await this.threadRecordEventService.emitThreadCreated({
      workspaceId: args.workspaceId,
      threadId: savedThread.id,
    });

    return { thread: savedThread, participation };
  }

  private async reconcileInitialAssistantParticipation({
    thread,
    shouldApplyAssistantParticipation,
    participation,
    ...args
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> &
    AgentChatAssistantParticipationArgs & {
      thread: AgentChatThreadWorkspaceEntity;
      shouldApplyAssistantParticipation: boolean;
      participation?: AgentChatAssistantParticipation;
    }): Promise<AgentChatThreadWorkspaceEntity> {
    if (!shouldApplyAssistantParticipation) {
      return thread;
    }

    return this.reconcileAssistantParticipation({
      ...args,
      thread,
      isInitialMessage: true,
      shouldEmitEvent: false,
      participation,
    });
  }

  // The client picks a new chat's id, so its first message creates the thread.
  // An existing thread is left for the caller to check access to.
  async createThreadIfMissing({
    threadId,
    title,
    isSubscribed,
    ...args
  }: AgentChatThreadAccessArgs &
    Omit<AgentChatThreadCreationArgs, 'id'>): Promise<
    AgentChatThreadCreationResult | undefined
  > {
    if (
      await this.threadRepository.existsBy(args.workspaceId, { id: threadId })
    ) {
      return;
    }

    try {
      return await this.createThreadWithParticipation({
        ...args,
        id: threadId,
        title,
        isSubscribed,
      });
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      return;
    }
  }

  async claimThreadForRun({
    title,
    ...args
  }: AgentChatThreadAccessArgs & { title: string }): Promise<void> {
    const threadBefore = await this.findThread(args);

    if (isDefined(threadBefore)) {
      return this.claimExistingThread({ args, threadBefore });
    }

    if (
      await this.createThreadIfMissing({ ...args, title, isSubscribed: false })
    ) {
      return;
    }

    const threadCreatedMeanwhile = await this.findThread(args);

    if (isDefined(threadCreatedMeanwhile)) {
      await this.claimExistingThread({
        args,
        threadBefore: threadCreatedMeanwhile,
      });
    }
  }

  private findThread(
    args: Pick<AgentChatThreadAccessArgs, 'workspaceId' | 'threadId'>,
  ): Promise<AgentChatThreadWorkspaceEntity | null> {
    return this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId },
    });
  }

  private async claimExistingThread({
    args,
    threadBefore,
  }: {
    args: AgentChatThreadAccessArgs;
    threadBefore: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    if (!isDefined(threadBefore.workspaceMemberId)) {
      const claimedThread =
        await this.sharingService.claimUnownedThreadForRun(args);

      if (isDefined(claimedThread)) {
        await this.participantService.emitParticipantCreated(args);
        await this.threadRecordEventService.emitThreadUpdated({
          workspaceId: args.workspaceId,
          threadBefore,
        });
      }
    }

    if (isDefined(threadBefore.deletedAt)) {
      await this.restoreDeletedThread({ args, threadBefore });
    }
  }

  async restoreThread(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    const threadBefore = await this.findThread(args);

    return this.restoreDeletedThread({ args, threadBefore });
  }

  async restoreDirectMessageThread({
    workspaceId,
    thread,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    await this.threadRepository.restore(workspaceId, {
      id: thread.id,
      conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
    });

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
      action: DatabaseEventAction.RESTORED,
    });
  }

  private async restoreDeletedThread({
    args,
    threadBefore,
  }: {
    args: AgentChatThreadAccessArgs;
    threadBefore: AgentChatThreadWorkspaceEntity | null;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.sharingService.restoreThreadWithAccess(args);

    if (isDefined(threadBefore)) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId: args.workspaceId,
        threadBefore,
        action: DatabaseEventAction.RESTORED,
      });
    }

    return thread;
  }

  // owned threads are skipped so an upsert cannot reassign them
  async assignCreatedThreadsToCreator({
    authContext,
    threadIds,
  }: {
    authContext: WorkspaceAuthContext;
    threadIds: string[];
  }): Promise<void> {
    if (!isUserAuthContext(authContext) || !isNonEmptyArray(threadIds)) {
      return;
    }

    const workspaceId = authContext.workspace.id;
    const { workspaceMemberId } = authContext;
    const unassignedThreadCriteria = { workspaceMemberId: IsNull() };

    const threadsBefore = await this.threadRepository.find(workspaceId, {
      where: { id: In(threadIds), ...unassignedThreadCriteria },
    });

    if (!isNonEmptyArray(threadsBefore)) {
      return;
    }

    const participantObjectMetadata =
      await this.sharingService.getParticipantObjectMetadata(workspaceId);

    const { generatedMaps: assignedThreads } =
      await this.threadRepository.update(
        workspaceId,
        {
          id: In(threadsBefore.map(({ id }) => id)),
          ...unassignedThreadCriteria,
        },
        { workspaceMemberId },
      );

    if (!isNonEmptyArray(assignedThreads)) {
      return;
    }

    const assignedThreadIds = assignedThreads.map(({ id }) => id);

    const setUpThreadIds =
      await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
        (transactionScope) =>
          this.sharingService.setUpCreatedThreadsInboxState({
            transactionScope,
            workspaceId,
            workspaceMemberId,
            threadIds: assignedThreadIds,
            participantObjectMetadata,
          }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    const assignedThreadRecords = await this.threadRepository.find(
      workspaceId,
      {
        where: { id: In(assignedThreadIds) },
      },
    );
    const threadsAfter: AgentChatThreadWorkspaceEntity[] = [];

    for (const thread of assignedThreadRecords) {
      const reconciledThread = await this.reconcileAssistantParticipation({
        workspaceId,
        workspaceMemberId,
        thread,
        isInitialMessage: true,
        shouldEmitEvent: false,
      });

      threadsAfter.push(reconciledThread);
    }

    // Sent first, so a new thread never shows as unread to its creator
    for (const threadId of setUpThreadIds) {
      await this.participantService.emitParticipantCreated({
        workspaceId,
        workspaceMemberId,
        threadId,
      });
    }

    for (const threadAfter of threadsAfter) {
      const threadBefore = threadsBefore.find(
        ({ id }) => id === threadAfter.id,
      );

      if (!isDefined(threadBefore)) {
        continue;
      }

      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
        threadAfter,
      });
    }
  }

  async findWritableThread(args: AgentChatThreadAccessArgs) {
    try {
      return await this.getWritableThread(args);
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

  async getWritableThread(args: AgentChatThreadAccessArgs) {
    return this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });
  }

  async notifyThreadActivityUpdated({
    threadId,
    workspaceMemberId,
    workspaceId,
    text,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    text: string;
  }): Promise<void> {
    const thread = await this.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    // Conversations sort by last activity, so a message moves its conversation
    // to the top when it is sent, not only once the turn ends
    const activity = await this.participantService.recordMemberActivity({
      threadId,
      workspaceMemberId,
      workspaceId,
      text,
    });

    await this.emitThreadActivityUpdated({ workspaceId, thread, activity });
  }

  private async reconcileAssistantParticipation({
    shouldEmitEvent,
    participation: providedParticipation,
    ...args
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> &
    AgentChatAssistantParticipationArgs & {
      thread: AgentChatThreadWorkspaceEntity;
      isInitialMessage: boolean;
      shouldEmitEvent: boolean;
      participation?: AgentChatAssistantParticipation;
    }): Promise<AgentChatThreadWorkspaceEntity> {
    const participation =
      providedParticipation ??
      (await this.assistantParticipationService.resolveAssistantParticipation(
        args,
      ));

    await this.assistantParticipationService.persistAssistantParticipation({
      workspaceId: args.workspaceId,
      thread: args.thread,
      participation,
      shouldEmitEvent,
    });

    return {
      ...args.thread,
      isAssistantParticipant: participation.isAssistantParticipant,
    };
  }

  // An assignee who could not reply is given edit access, as Front lets an
  // assignment reach a conversation the assignee could not see. A former
  // assignee keeps following the chat.
  async assign({
    assigneeWorkspaceMemberId,
    ...args
  }: AgentChatThreadAccessArgs & {
    assigneeWorkspaceMemberId: string | null;
  }): Promise<void> {
    const thread = await this.getWritableThread(args);

    if (
      isDefined(assigneeWorkspaceMemberId) &&
      assigneeWorkspaceMemberId !== args.workspaceMemberId
    ) {
      const [assigneeWhoCanReply] =
        await this.sharingService.shareThreadWithMembers({
          ...args,
          memberIds: [assigneeWorkspaceMemberId],
        });

      if (!isDefined(assigneeWhoCanReply)) {
        throw new AiException(
          'The assignee cannot reply in the chat',
          AiExceptionCode.CHAT_THREAD_ASSIGNEE_CANNOT_REPLY,
        );
      }
    }

    const writeAssignment = async ({
      manager,
      table,
    }: AgentHistoryStorageContext): Promise<void> => {
      const assignedThreadIds = await manager.query<{ id: string }[]>(
        `WITH assigned_thread AS (
           UPDATE ${table('agentChatThread')}
           SET "assigneeId" = $2::uuid,
             "updatedAt" = now(),
             "writerWorkspaceMemberIds" = CASE
               WHEN $2::uuid IS NULL
                 OR $2::uuid = "workspaceMemberId"
                 OR $2::uuid::text = ANY(COALESCE("writerWorkspaceMemberIds", '{}'))
               THEN "writerWorkspaceMemberIds"
               ELSE array_append(COALESCE("writerWorkspaceMemberIds", '{}'), $2::uuid::text)
             END
           WHERE id = $1
           RETURNING id
         )
         SELECT id FROM assigned_thread`,
        [args.threadId, assigneeWorkspaceMemberId],
      );

      if (assignedThreadIds.length !== 1) {
        throwAgentChatThreadNotFound();
      }
    };

    if (isDefined(assigneeWorkspaceMemberId)) {
      await this.participantService.markAsAssigned({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        workspaceMemberId: assigneeWorkspaceMemberId,
        isSelfAssigned: assigneeWorkspaceMemberId === args.workspaceMemberId,
        writeAssignment,
      });
    } else {
      await this.threadRepository.query(args.workspaceId, writeAssignment);
    }

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: args.workspaceId,
      threadBefore: thread,
    });
  }

  async moveToChannel({
    channelId,
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
    channelId: string | null;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;
    const thread = await this.sharingService.getCallerWritableThreadOrThrow({
      authContext,
      threadId,
    });

    if (
      thread.conversationType ===
        AgentChatThreadConversationType.DIRECT_MESSAGE &&
      isDefined(channelId)
    ) {
      return throwAgentChatThreadNotFound();
    }

    if (isDefined(channelId)) {
      await this.channelAccessService.assertCallerChannelAccessOrThrow({
        authContext,
        channelId,
      });
    }

    if ((thread.channelId ?? null) === channelId) {
      return;
    }

    // Owner re-checked in the UPDATE: removing a member clears it on their channel chats
    const movedThreadIds =
      await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
        async (transactionScope) => {
          if (isDefined(channelId)) {
            await lockAgentChatChannelForThreadWriteOrThrow({
              transactionScope,
              channelRepository: this.channelRepository,
              workspaceId: workspaceId,
              channelId,
            });
          }

          const threadRepository =
            transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
              'agentChatThread',
              { shouldSkipEventEmission: true },
            );
          const currentThread = await threadRepository.findOne({
            select: ['channelId', 'workspaceMemberId'],
            where: { id: threadId },
          });

          if (!isDefined(currentThread)) {
            return throwAgentChatThreadNotFound();
          }

          if (
            !isDefined(channelId) &&
            !isDefined(currentThread.workspaceMemberId)
          ) {
            return [];
          }

          const sourceChannelId = currentThread.channelId ?? null;
          const { generatedMaps: movedThreads } = await threadRepository.update(
            {
              id: threadId,
              channelId: sourceChannelId ?? IsNull(),
              ...(isDefined(channelId)
                ? {}
                : { workspaceMemberId: Not(IsNull()) }),
            },
            {
              channelId,
              channelArchivedAt: null,
              channelSnoozedUntil: null,
            },
          );

          if (!isNonEmptyArray(movedThreads)) {
            return throwAgentChatChannelBusy();
          }

          const movedThreadIds: string[] = movedThreads.map(({ id }) => id);

          await this.channelGrantService.rewriteThreadGrantsInTransaction({
            transactionScope,
            workspaceId: workspaceId,
            threadIds: movedThreadIds,
            affectedChannelIds: [sourceChannelId, channelId],
          });

          return movedThreadIds;
        },
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    if (movedThreadIds.length === 0) {
      throw new AiException(
        'A chat without an owner cannot leave its channel',
        AiExceptionCode.CHAT_THREAD_CANNOT_LEAVE_CHANNEL,
      );
    }

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
    });
  }

  async moveOwnThreadToChannel({
    thread,
    channelId,
    ...args
  }: AgentChatThreadAccessArgs & {
    thread: AgentChatThreadWorkspaceEntity;
    channelId: string | null;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    if (
      thread.workspaceMemberId !== args.workspaceMemberId ||
      (thread.channelId ?? null) === channelId
    ) {
      return thread;
    }

    await this.moveToChannel({
      threadId: args.threadId,
      channelId,
      authContext: await this.sharingService.getAuthContextOrThrow(args),
    });

    return this.getWritableThread(args);
  }

  // Activity no member wrote, such as an agent turn or an application's
  // message, leaves the chat unread for everyone
  async recordThreadActivity({
    workspaceId,
    threadId,
    text,
    threadBefore,
  }: {
    workspaceId: string;
    threadId: string;
    text: string | null;
    // Read before the message was written, so the event carries what the
    // message changed, such as a question now waiting on the member
    threadBefore?: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    const thread =
      threadBefore ??
      (await this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
      }));

    if (!isDefined(thread)) {
      return;
    }

    const activity = await this.recordAgentActivity({
      workspaceId,
      threadId,
      text,
    });

    if (!isDefined(activity)) {
      return;
    }

    await this.emitThreadActivityUpdated({ workspaceId, thread, activity });
  }

  private async recordAgentActivity({
    workspaceId,
    threadId,
    text,
  }: {
    workspaceId: string;
    threadId: string;
    text: string | null;
  }): Promise<AgentChatThreadActivity | null> {
    const [activity] = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<AgentChatThreadActivity[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "updatedAt" = now(),
               ${buildAgentChatThreadActivitySetClause({ textParameter: '$2' })}
             WHERE id = $1
             RETURNING ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS}
           )
           SELECT ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS} FROM thread`,
          [threadId, text],
        ),
    );

    return activity ?? null;
  }

  // Open chat lists reorder and bring the chat back from these events
  private async emitThreadActivityUpdated({
    workspaceId,
    thread,
    activity: { lastActivityAt, updatedAt, ...recordedColumns },
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    activity: AgentChatThreadActivity;
  }): Promise<void> {
    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
      threadAfter: {
        ...thread,
        ...recordedColumns,
        lastActivityAt: lastActivityAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  }
}
