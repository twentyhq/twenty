import { Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { touchAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/touch-agent-chat-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatRecordEventService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-record-event.service';
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
    private readonly recordEventService: AgentChatRecordEventService,
    private readonly participantService: AgentChatThreadParticipantService,
  ) {}

  // A thread with no member belongs to no inbox, and only the server reads it
  async createThread({
    workspaceMemberId,
    ...args
  }: Omit<
    Parameters<AgentChatSharingService['createThread']>[0],
    'workspaceMemberId'
  > & {
    workspaceMemberId: string | null;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const { thread, participant } = isDefined(workspaceMemberId)
      ? await this.sharingService.createThread({ ...args, workspaceMemberId })
      : {
          thread: await this.threadRepository.query(
            args.workspaceId,
            async ({ manager, table }) =>
              (
                await manager.query<AgentChatThreadWorkspaceEntity[]>(
                  `INSERT INTO ${table('agentChatThread')} (id, title) VALUES ($1, $2) RETURNING *`,
                  [args.id ?? randomUUID(), args.title ?? null],
                )
              )[0],
          ),
          participant: undefined,
        };

    // Sent first, so the new thread never shows as unread to its owner
    await this.recordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatThreadParticipant',
      before: null,
      after: participant,
    });
    await this.recordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatThread',
      before: null,
      after: thread,
    });

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
    const participantObjectMetadataId =
      await this.sharingService.findParticipantObjectMetadataId(workspaceId);

    const { threadsBefore, threadsAfter, participants } =
      await this.threadRepository.query(workspaceId, async (context) => {
        const threadsBefore = await context.manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `SELECT * FROM ${context.table('agentChatThread')}
           WHERE id = ANY($1::uuid[]) AND "workspaceMemberId" IS NULL FOR UPDATE`,
          [threadIds],
        );
        const assignedThreads = await context.manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `WITH assigned_thread AS (
             UPDATE ${context.table('agentChatThread')}
             SET "workspaceMemberId" = $2, "userWorkspaceId" = $3, "updatedAt" = now()
             WHERE id = ANY($1::uuid[]) AND "workspaceMemberId" IS NULL
             RETURNING *
           )
           SELECT * FROM assigned_thread`,
          [threadIds, workspaceMemberId, authContext.userWorkspaceId],
        );
        const { threads, participants } =
          await this.sharingService.setUpCreatedThreadsInboxState({
            ...context,
            workspaceId,
            workspaceMemberId,
            threadIds: assignedThreads.map(({ id }) => id),
            participantObjectMetadataId,
          });

        return {
          threadsBefore,
          threadsAfter: assignedThreads.map(
            (thread) => threads.find(({ id }) => id === thread.id) ?? thread,
          ),
          participants,
        };
      });

    // Sent first, so a new thread never shows as unread to its creator
    for (const participant of participants) {
      await this.recordEventService.emit({
        workspaceId,
        objectName: 'agentChatThreadParticipant',
        before: null,
        after: participant,
      });
    }

    for (const threadAfter of threadsAfter) {
      await this.recordEventService.emit({
        workspaceId,
        objectName: 'agentChatThread',
        before: threadsBefore.find(({ id }) => id === threadAfter.id),
        after: threadAfter,
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
    await this.getWritableThread({ threadId, workspaceMemberId, workspaceId });

    // Conversations sort by last activity, so a message moves its conversation
    // to the top when it is sent, not only once the turn ends
    await this.participantService.recordMemberActivity({
      threadId,
      workspaceMemberId,
      workspaceId,
      text,
    });
  }

  // A mentioned member follows the chat like one who wrote in it, and finds
  // it unread in their inbox even if they had read or archived it
  async addParticipants({
    participantWorkspaceMemberIds,
    ...args
  }: AgentChatThreadAccessArgs & {
    participantWorkspaceMemberIds: string[];
  }): Promise<string[]> {
    await this.getWritableThread(args);
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

    if (
      participantMemberIds.length === 0 ||
      !(await this.sharingService.hasInboxState(args.workspaceId))
    ) {
      return participantMemberIds;
    }

    const { threadBefore, threadAfter } = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        const [threadBefore] = await manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
          [args.threadId],
        );
        const [threadAfter] = await manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "updatedAt" = now(),
               "writerWorkspaceMemberIds" = COALESCE("writerWorkspaceMemberIds", '{}') || ARRAY(
                 SELECT member_id FROM unnest($2::text[]) AS member_id
                 WHERE NOT member_id = ANY(COALESCE("writerWorkspaceMemberIds", '{}'))
                   AND member_id IS DISTINCT FROM "workspaceMemberId"::text
               )
             WHERE id = $1
             RETURNING *
           )
           SELECT * FROM thread`,
          [args.threadId, participantMemberIds],
        );

        return { threadBefore, threadAfter };
      },
    );

    for (const participantMemberId of participantMemberIds) {
      await this.participantService.markAsMentioned({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        workspaceMemberId: participantMemberId,
      });
    }

    await this.recordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatThread',
      before: threadBefore,
      after: threadAfter,
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
    if (!(await this.sharingService.hasInboxState(args.workspaceId))) {
      throw new AiException(
        'Chat assignees are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }

    await this.getWritableThread(args);

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

    let threadBefore: AgentChatThreadWorkspaceEntity | undefined;
    let threadAfter: AgentChatThreadWorkspaceEntity | undefined;

    const writeAssignment = async ({
      manager,
      table,
    }: AgentHistoryStorageContext): Promise<void> => {
      [threadBefore] = await manager.query<AgentChatThreadWorkspaceEntity[]>(
        `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
        [args.threadId],
      );
      [threadAfter] = await manager.query<AgentChatThreadWorkspaceEntity[]>(
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
           RETURNING *
         )
         SELECT * FROM assigned_thread`,
        [args.threadId, assigneeWorkspaceMemberId],
      );

      if (!isDefined(threadAfter)) {
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

    await this.recordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatThread',
      before: threadBefore,
      after: threadAfter,
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
    const activity = await touchAgentChatThread({
      repository: this.threadRepository,
      workspaceId,
      threadId,
      recordedActivity: (await this.sharingService.hasInboxState(workspaceId))
        ? { text }
        : null,
    });

    await this.recordEventService.emit({
      workspaceId,
      objectName: 'agentChatThread',
      before: threadBefore ?? activity.threadBefore,
      after: activity.threadAfter,
    });
  }
}
