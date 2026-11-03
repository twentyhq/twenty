import { Injectable, Logger } from '@nestjs/common';

import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AgentChatInboxDeliveryWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery-writer.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-delivery-reason.type';
import { type AgentChatInboxDeliveryResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-delivery-result.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
export class AgentChatInboxDeliveryService {
  private readonly logger = new Logger(AgentChatInboxDeliveryService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly deliveryWriterService: AgentChatInboxDeliveryWriterService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async deliver({
    messageId,
    mentionedWorkspaceMemberIds,
    initialRecipientWorkspaceMemberIds,
    ...access
  }: AgentChatThreadAccessArgs & {
    messageId: string;
    mentionedWorkspaceMemberIds: string[];
    initialRecipientWorkspaceMemberIds: string[];
  }): Promise<AgentChatInboxDeliveryResult> {
    let deliveredMentionWorkspaceMemberIds: string[] = [];
    let deliveredRecipientWorkspaceMemberIds: string[] = [];

    if (isNonEmptyArray(mentionedWorkspaceMemberIds)) {
      try {
        deliveredMentionWorkspaceMemberIds = await this.addMembers({
          ...access,
          workspaceMemberIds: mentionedWorkspaceMemberIds,
          reason: 'mention',
        });
      } catch (error) {
        this.logger.warn(
          doNotTranslate(
            `Could not deliver mentions for chat message ${messageId} in thread ${access.threadId} of workspace ${access.workspaceId}: ${formatErrorWithCause(error)}`,
          ),
        );
      }
    }

    const deliveredMentionWorkspaceMemberIdSet = new Set(
      deliveredMentionWorkspaceMemberIds,
    );
    const remainingInitialRecipientWorkspaceMemberIds =
      initialRecipientWorkspaceMemberIds.filter(
        (workspaceMemberId) =>
          !deliveredMentionWorkspaceMemberIdSet.has(workspaceMemberId),
      );

    if (isNonEmptyArray(remainingInitialRecipientWorkspaceMemberIds)) {
      try {
        deliveredRecipientWorkspaceMemberIds = await this.addMembers({
          ...access,
          workspaceMemberIds: remainingInitialRecipientWorkspaceMemberIds,
          reason: 'recipient',
        });
      } catch (error) {
        this.logger.warn(
          doNotTranslate(
            `Could not deliver initial recipients for chat message ${messageId} in thread ${access.threadId} of workspace ${access.workspaceId}: ${formatErrorWithCause(error)}`,
          ),
        );
      }
    }

    const deliveredWorkspaceMemberIdSet = new Set([
      ...deliveredMentionWorkspaceMemberIds,
      ...deliveredRecipientWorkspaceMemberIds,
    ]);

    return {
      deliveredMentionWorkspaceMemberIds,
      deliveredRecipientWorkspaceMemberIds: [
        ...new Set(initialRecipientWorkspaceMemberIds),
      ].filter((workspaceMemberId) =>
        deliveredWorkspaceMemberIdSet.has(workspaceMemberId),
      ),
    };
  }

  async addMembers({
    workspaceMemberIds,
    reason,
    ...access
  }: AgentChatThreadAccessArgs & {
    workspaceMemberIds: string[];
    reason: AgentChatInboxDeliveryReason;
  }): Promise<string[]> {
    await this.sharingService.assertHasMentionResolutionOrThrow(
      access.workspaceId,
    );

    const thread = await this.sharingService.getThreadWithAccess({
      ...access,
      operationType: 'update',
    });
    const candidateMemberIds = [...new Set(workspaceMemberIds)].filter(
      (memberId) => memberId !== access.workspaceMemberId,
    );

    if (!isNonEmptyArray(candidateMemberIds)) {
      return [];
    }

    const deliveredMemberIds = await this.sharingService.shareThreadWithMembers(
      {
        ...access,
        memberIds: candidateMemberIds,
      },
    );

    if (!isNonEmptyArray(deliveredMemberIds)) {
      return deliveredMemberIds;
    }

    await this.deliveryWriterService.write({
      ...access,
      workspaceMemberIds: deliveredMemberIds,
      reason,
    });

    await this.threadRepository.query(
      access.workspaceId,
      ({ manager, table }) =>
        manager.query(
          `UPDATE ${table('agentChatThread')}
           SET "updatedAt" = now(),
             "writerWorkspaceMemberIds" = COALESCE("writerWorkspaceMemberIds", '{}') || ARRAY(
               SELECT member_id FROM unnest($2::text[]) AS member_id
               WHERE NOT member_id = ANY(COALESCE("writerWorkspaceMemberIds", '{}'))
                 AND member_id IS DISTINCT FROM "workspaceMemberId"::text
             )
           WHERE id = $1`,
          [access.threadId, deliveredMemberIds],
        ),
    );

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: access.workspaceId,
      threadBefore: thread,
    });

    return deliveredMemberIds;
  }
}
