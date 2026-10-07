import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { touchAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/touch-agent-chat-thread.util';
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
  ) {}

  async createThread(
    args: Parameters<AgentChatSharingService['createThread']>[0],
  ) {
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

    if (
      participantMemberIds.length === 0 ||
      !(await this.sharingService.hasInboxState(args.workspaceId))
    ) {
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
    if (!(await this.sharingService.hasInboxState(args.workspaceId))) {
      throw new AiException(
        'Chat assignees are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }

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

    const activity = (await this.sharingService.hasInboxState(workspaceId))
      ? await this.recordAgentActivity({ workspaceId, threadId, text })
      : await touchAgentChatThread({
          repository: this.threadRepository,
          workspaceId,
          threadId,
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
        lastActivityAt: lastActivityAt?.toISOString() ?? thread.lastActivityAt,
        updatedAt: updatedAt.toISOString(),
      },
    });
  }
}
