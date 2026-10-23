import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
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
  ) {}

  async createThread(
    args: Parameters<AgentChatSharingService['createThread']>[0],
  ) {
    if (isDefined(args.channelId)) {
      await this.channelAccessService.assertChannelAccess({
        workspaceId: args.workspaceId,
        workspaceMemberId: args.workspaceMemberId,
        channelId: args.channelId,
      });
    }

    const savedThread = await this.sharingService.createThread(args);

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

    return savedThread;
  }

  // The client picks a new chat's id, so its first message creates the thread.
  // An existing thread is left for the caller to check access to.
  async createThreadIfMissing({
    threadId,
    title,
    isSubscribed,
    ...args
  }: AgentChatThreadAccessArgs & {
    title?: string;
    isSubscribed?: boolean;
    channelId?: string;
  }): Promise<boolean> {
    if (
      await this.threadRepository.existsBy(args.workspaceId, { id: threadId })
    ) {
      return false;
    }

    try {
      await this.createThread({ ...args, id: threadId, title, isSubscribed });
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      return false;
    }

    return true;
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
    const participantObjectMetadataId =
      await this.sharingService.getParticipantObjectMetadataId(workspaceId);

    const setUpThreads = await this.threadRepository.query(
      workspaceId,
      (context) =>
        this.sharingService.setUpCreatedThreadsInboxState({
          ...context,
          workspaceId,
          workspaceMemberId,
          threadIds: assignedThreadIds,
          participantObjectMetadataId,
        }),
    );

    // Sent first, so a new thread never shows as unread to its creator
    for (const { id: threadId } of setUpThreads) {
      await this.participantService.emitParticipantCreated({
        workspaceId,
        workspaceMemberId,
        threadId,
      });
    }

    const threadsAfter = await this.threadRepository.find(workspaceId, {
      where: { id: In(assignedThreadIds) },
    });

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

  // A mentioned member follows the chat like one who wrote in it, and finds
  // it unread in their inbox even if they had read or archived it
  async addParticipants({
    participantWorkspaceMemberIds,
    ...args
  }: AgentChatThreadAccessArgs & {
    participantWorkspaceMemberIds: string[];
  }): Promise<string[]> {
    const thread = await this.getWritableThread(args);
    const candidateMemberIds = [
      ...new Set(participantWorkspaceMemberIds),
    ].filter((memberId) => memberId !== args.workspaceMemberId);

    if (candidateMemberIds.length === 0) {
      return [];
    }

    const participantMemberIds =
      await this.sharingService.shareThreadWithMembers({
        ...args,
        memberIds: candidateMemberIds,
      });

    if (participantMemberIds.length === 0) {
      return participantMemberIds;
    }

    await this.threadRepository.query(args.workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentChatThread')}
         SET "updatedAt" = now(),
           "writerWorkspaceMemberIds" = COALESCE("writerWorkspaceMemberIds", '{}') || ARRAY(
             SELECT member_id FROM unnest($2::text[]) AS member_id
             WHERE NOT member_id = ANY(COALESCE("writerWorkspaceMemberIds", '{}'))
               AND member_id IS DISTINCT FROM "workspaceMemberId"::text
           )
         WHERE id = $1`,
        [args.threadId, participantMemberIds],
      ),
    );

    for (const participantMemberId of participantMemberIds) {
      await this.participantService.markAsMentioned({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        workspaceMemberId: participantMemberId,
      });
    }

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: args.workspaceId,
      threadBefore: thread,
    });

    return participantMemberIds;
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
    ...args
  }: AgentChatThreadAccessArgs & {
    channelId: string | null;
  }): Promise<void> {
    const thread = await this.getWritableThread(args);

    if (isDefined(channelId)) {
      await this.channelAccessService.assertChannelAccess({
        ...args,
        channelId,
      });
    }

    if ((thread.channelId ?? null) === channelId) {
      return;
    }

    // Owner re-checked in the UPDATE: removing a member clears it on their channel chats
    const movedThreadIds = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        if (isDefined(channelId)) {
          await lockAgentChatChannelForThreadWriteOrThrow({
            manager,
            workspaceId: args.workspaceId,
            channelId,
          });
        }

        const [lockedThread] = await manager.query<
          { channelId: string | null }[]
        >(
          `SELECT "channelId" FROM ${table('agentChatThread')} WHERE id = $1 FOR NO KEY UPDATE`,
          [args.threadId],
        );

        if (!isDefined(lockedThread)) {
          return throwAgentChatThreadNotFound();
        }

        const movedThreads = await manager.query<{ id: string }[]>(
          `WITH moved_thread AS (
             UPDATE ${table('agentChatThread')}
             SET "channelId" = $2::uuid,
               "channelArchivedAt" = NULL,
               "channelSnoozedUntil" = NULL,
               "updatedAt" = now()
             WHERE id = $1
               AND ($2::uuid IS NOT NULL OR "workspaceMemberId" IS NOT NULL)
             RETURNING id
           )
           SELECT id FROM moved_thread`,
          [args.threadId, channelId],
        );

        await this.channelGrantService.rewriteThreadGrantsInTransaction({
          manager,
          workspaceId: args.workspaceId,
          threadIds: movedThreads.map(({ id }) => id),
          affectedChannelIds: [lockedThread.channelId, channelId],
        });

        return movedThreads;
      },
    );

    if (movedThreadIds.length === 0) {
      throw new AiException(
        'A chat without an owner cannot leave its channel',
        AiExceptionCode.CHAT_THREAD_CANNOT_LEAVE_CHANNEL,
      );
    }

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: args.workspaceId,
      threadBefore: thread,
    });
  }

  // The message is already sent, so a mention that cannot be applied leaves the
  // member out rather than failing the send
  async addMentionedParticipants({
    mentionedWorkspaceMemberIds,
    ...args
  }: AgentChatThreadAccessArgs & {
    mentionedWorkspaceMemberIds: string[];
  }): Promise<string[]> {
    if (mentionedWorkspaceMemberIds.length === 0) {
      return [];
    }

    try {
      return await this.addParticipants({
        ...args,
        participantWorkspaceMemberIds: mentionedWorkspaceMemberIds,
      });
    } catch (error) {
      this.logger.error(
        `Could not add the members mentioned in chat ${args.threadId} of workspace ${args.workspaceId}`,
        error,
      );

      return [];
    }
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
