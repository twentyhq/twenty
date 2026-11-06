import { Injectable, Logger } from '@nestjs/common';

import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Equal, IsNull, Or } from 'typeorm';

import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatInboxParticipantWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-participant-writer.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
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
    private readonly inboxParticipantWriterService: AgentChatInboxParticipantWriterService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async deliverMessageToInboxes({
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
        deliveredMentionWorkspaceMemberIds =
          await this.deliverThreadToMemberInboxes({
            ...access,
            workspaceMemberIds: mentionedWorkspaceMemberIds,
            reason: AgentChatInboxDeliveryReason.MENTION,
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
        deliveredRecipientWorkspaceMemberIds =
          await this.deliverThreadToMemberInboxes({
            ...access,
            workspaceMemberIds: remainingInitialRecipientWorkspaceMemberIds,
            reason: AgentChatInboxDeliveryReason.RECIPIENT,
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

  async deliverThreadToMemberInboxes({
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
    const candidateWorkspaceMemberIds = [...new Set(workspaceMemberIds)].filter(
      (workspaceMemberId) => workspaceMemberId !== access.workspaceMemberId,
    );

    if (!isNonEmptyArray(candidateWorkspaceMemberIds)) {
      return [];
    }

    const deliveredWorkspaceMemberIds =
      await this.sharingService.shareThreadWithMembers({
        ...access,
        memberIds: candidateWorkspaceMemberIds,
      });

    if (!isNonEmptyArray(deliveredWorkspaceMemberIds)) {
      return deliveredWorkspaceMemberIds;
    }

    await this.inboxParticipantWriterService.writeParticipantInboxState({
      ...access,
      workspaceMemberIds: deliveredWorkspaceMemberIds,
      reason,
    });

    await this.appendDeliveredWriterWorkspaceMemberIds({
      workspaceId: access.workspaceId,
      threadId: access.threadId,
      workspaceMemberIds: deliveredWorkspaceMemberIds,
    });

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: access.workspaceId,
      threadBefore: thread,
    });

    return deliveredWorkspaceMemberIds;
  }

  private async appendDeliveredWriterWorkspaceMemberIds({
    workspaceId,
    threadId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    threadId: string;
    workspaceMemberIds: string[];
  }): Promise<void> {
    while (true) {
      const thread = await this.threadRepository.findOneOrFail(workspaceId, {
        where: { id: threadId },
        select: ['id', 'workspaceMemberId', 'writerWorkspaceMemberIds'],
      });
      const existingWriterWorkspaceMemberIdSet = new Set(
        thread.writerWorkspaceMemberIds ?? [],
      );
      const newWriterWorkspaceMemberIds = [
        ...new Set(workspaceMemberIds),
      ].filter(
        (workspaceMemberId) =>
          workspaceMemberId !== thread.workspaceMemberId &&
          !existingWriterWorkspaceMemberIdSet.has(workspaceMemberId),
      );
      const result = await this.threadRepository.update(
        workspaceId,
        {
          id: threadId,
          workspaceMemberId: thread.workspaceMemberId ?? IsNull(),
          writerWorkspaceMemberIds: isNonEmptyArray(
            thread.writerWorkspaceMemberIds,
          )
            ? Equal(thread.writerWorkspaceMemberIds)
            : Or(IsNull(), Equal([])),
        },
        {
          writerWorkspaceMemberIds: [
            ...(thread.writerWorkspaceMemberIds ?? []),
            ...newWriterWorkspaceMemberIds,
          ],
        },
      );

      if (result.affected > 0) {
        return;
      }
    }
  }
}
