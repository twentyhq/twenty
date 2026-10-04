import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { touchAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/touch-agent-chat-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatThreadService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly conversationWriterService: AgentConversationWriterService,
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

  // A turn the agent opens has no user message: its context stands in for one
  async openAgentTurn({
    workspaceId,
    threadId,
    id,
    context,
  }: {
    workspaceId: string;
    threadId: string;
    id?: string;
    context: string;
  }): Promise<string> {
    const hasTurnContext =
      await this.sharingService.hasTurnContext(workspaceId);

    return this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      id,
      agentId: null,
      ...(hasTurnContext ? { context } : {}),
    });
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
