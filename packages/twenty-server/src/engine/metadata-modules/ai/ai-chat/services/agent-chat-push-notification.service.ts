import { Injectable, Logger } from '@nestjs/common';

import { type AgentChatInboxState } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type SendAgentChatPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications.job';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { buildAgentChatPushNotification } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-push-notification.util';
import { getAgentChatPushNotificationReason } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-push-notification-reason.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const RENOTIFY_COOLDOWN_MS = 15_000;

const toIsoStringOrNull = (date: Date | string | null) =>
  isDefined(date) ? new Date(date).toISOString() : null;

@Injectable()
export class AgentChatPushNotificationService {
  private readonly logger = new Logger(AgentChatPushNotificationService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly i18nService: I18nService,
    private readonly sharingService: AgentChatSharingService,
    private readonly webPushService: WebPushService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async sendPushNotifications({
    workspaceId,
    threadId,
    lastActivityAt,
  }: SendAgentChatPushNotificationsJobData): Promise<void> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (workspace?.activationStatus !== WorkspaceActivationStatus.ACTIVE) {
      return;
    }

    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (
      !isDefined(thread) ||
      !isDefined(thread.lastActivityAt) ||
      new Date(thread.lastActivityAt).getTime() >
        new Date(lastActivityAt).getTime()
    ) {
      return;
    }

    const participants = await this.findParticipants({
      workspaceId,
      threadId: thread.id,
    });
    const candidateWorkspaceMemberIds = [
      ...new Set(
        [
          ...participants.keys(),
          thread.directMessageFirstWorkspaceMemberId,
          thread.directMessageSecondWorkspaceMemberId,
          thread.assigneeId,
        ].filter(isDefined),
      ),
    ];
    const focusedWorkspaceMemberIds =
      await this.webPushService.findWorkspaceMemberIdsWithFocusedTab({
        workspaceId,
        workspaceMemberIds: candidateWorkspaceMemberIds,
      });
    const unfocusedWorkspaceMemberIds = candidateWorkspaceMemberIds.filter(
      (workspaceMemberId) => !focusedWorkspaceMemberIds.has(workspaceMemberId),
    );

    if (unfocusedWorkspaceMemberIds.length === 0) {
      return;
    }

    const workspaceMemberById = await this.findWorkspaceMemberById({
      workspaceId,
      workspaceMemberIds: [
        ...unfocusedWorkspaceMemberIds,
        thread.lastMessageSenderWorkspaceMemberId,
      ].filter(isDefined),
    });
    const recipients = unfocusedWorkspaceMemberIds.flatMap(
      (workspaceMemberId) => {
        const workspaceMember = workspaceMemberById[workspaceMemberId];

        if (!isDefined(workspaceMember)) {
          return [];
        }

        const reason = getAgentChatPushNotificationReason({
          thread,
          participant: participants.get(workspaceMemberId),
          workspaceMemberId,
          inboxNotificationLevel: workspaceMember.inboxNotificationLevel,
        });

        return isDefined(reason) ? [{ workspaceMember, reason }] : [];
      },
    );

    if (recipients.length === 0) {
      return;
    }

    const webPushSubscriptionsByUserId =
      await this.webPushService.findWebPushSubscriptionsByUserId({
        workspaceId,
        userIds: recipients.map(
          ({ workspaceMember }) => workspaceMember.userId,
        ),
      });

    for (const { workspaceMember, reason } of recipients) {
      const webPushSubscriptions =
        webPushSubscriptionsByUserId[workspaceMember.userId];

      if (!isNonEmptyArray(webPushSubscriptions)) {
        continue;
      }

      try {
        await this.sendPushNotificationToRecipient({
          workspaceId,
          thread,
          recipient: workspaceMember,
          isRenotifyForced: reason === 'DIRECT_MESSAGE' || reason === 'MENTION',
          webPushSubscriptions,
          workspaceMemberById,
        });
      } catch (error) {
        this.logger.warn(
          `Could not send the push notification of thread ${thread.id} to workspace member ${workspaceMember.id} in workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private async sendPushNotificationToRecipient({
    workspaceId,
    thread,
    recipient,
    isRenotifyForced,
    webPushSubscriptions,
    workspaceMemberById,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    recipient: WorkspaceMemberWorkspaceEntity;
    isRenotifyForced: boolean;
    webPushSubscriptions: WebPushSubscriptionEntity[];
    workspaceMemberById: Partial<
      Record<string, WorkspaceMemberWorkspaceEntity>
    >;
  }): Promise<void> {
    const [readableThreadId] = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId: recipient.id,
      threadIds: [thread.id],
    });

    if (!isDefined(readableThreadId)) {
      return;
    }

    const isOutsideRenotifyCooldown =
      await this.cacheStorageService.setIfAbsent(
        `renotify-cooldown:${recipient.id}:${thread.id}`,
        true,
        RENOTIFY_COOLDOWN_MS,
      );

    await this.webPushService.sendNotification({
      workspaceId,
      userId: recipient.userId,
      webPushSubscriptions,
      notification: {
        ...buildAgentChatPushNotification({
          i18n: this.i18nService.getI18nInstance(recipient.locale),
          thread,
          recipientWorkspaceMemberId: recipient.id,
          workspaceMemberById,
          isPreviewEnabled: recipient.isInboxNotificationPreviewEnabled,
        }),
        renotify: isRenotifyForced || isOutsideRenotifyCooldown,
      },
    });
  }

  private async findParticipants({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<Map<string, AgentChatInboxState>> {
    const participants =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
              'agentChatThreadParticipant',
            )
            .find({
              select: [
                'workspaceMemberId',
                'lastReadAt',
                'archivedAt',
                'snoozedUntil',
                'isSubscribed',
                'lastMentionedAt',
                'mentionsResolvedAt',
              ],
              where: { threadId },
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    return new Map(
      participants.map((participant) => [
        participant.workspaceMemberId,
        {
          lastReadAt: toIsoStringOrNull(participant.lastReadAt),
          archivedAt: toIsoStringOrNull(participant.archivedAt),
          snoozedUntil: toIsoStringOrNull(participant.snoozedUntil),
          isSubscribed: participant.isSubscribed,
          lastMentionedAt: toIsoStringOrNull(participant.lastMentionedAt),
          mentionsResolvedAt: toIsoStringOrNull(participant.mentionsResolvedAt),
        },
      ]),
    );
  }

  private async findWorkspaceMemberById({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<Partial<Record<string, WorkspaceMemberWorkspaceEntity>>> {
    const workspaceMembers =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return workspaceMemberRepository.find({
          where: { id: In(workspaceMemberIds) },
        });
      }, buildSystemAuthContext(workspaceId));

    return Object.fromEntries(
      workspaceMembers.map((workspaceMember) => [
        workspaceMember.id,
        workspaceMember,
      ]),
    );
  }
}
