import { Injectable, Logger } from '@nestjs/common';

import { type AgentChatInboxState } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type SendAgentChatPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications.job';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { buildAgentChatPushNotification } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-push-notification.util';
import { getAgentChatPushNotificationReason } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-push-notification-reason.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RENOTIFY_COOLDOWN_MS = 15_000;

const toIsoStringOrNull = (date: Date | null) => date?.toISOString() ?? null;

@Injectable()
export class AgentChatPushNotificationService {
  private readonly logger = new Logger(AgentChatPushNotificationService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly i18nService: I18nService,
    private readonly sharingService: AgentChatSharingService,
    private readonly webPushService: WebPushService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async sendPushNotifications({
    workspaceId,
    thread,
  }: SendAgentChatPushNotificationsJobData): Promise<void> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (
      workspace?.activationStatus !== WorkspaceActivationStatus.ACTIVE ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspaceId,
      ))
    ) {
      return;
    }

    const participants = await this.findParticipants({
      workspaceId,
      threadId: thread.id,
    });
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const recipientWorkspaceMemberIds = new Set(
      [
        ...participants.keys(),
        thread.directMessageFirstWorkspaceMemberId,
        thread.directMessageSecondWorkspaceMemberId,
        thread.assigneeId,
      ].filter(isDefined),
    );

    for (const recipientWorkspaceMemberId of recipientWorkspaceMemberIds) {
      const recipient =
        flatWorkspaceMemberMaps.byId[recipientWorkspaceMemberId];

      if (!isDefined(recipient) || isDefined(recipient.deletedAt)) {
        continue;
      }

      try {
        await this.sendPushNotificationToRecipient({
          workspaceId,
          thread,
          recipient,
          participant: participants.get(recipient.id),
          workspaceMemberById: flatWorkspaceMemberMaps.byId,
        });
      } catch (error) {
        this.logger.warn(
          `Could not send the push notification of thread ${thread.id} to workspace member ${recipient.id} in workspace ${workspaceId}: ${
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
    participant,
    workspaceMemberById,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    recipient: FlatWorkspaceMember;
    participant: AgentChatInboxState | undefined;
    workspaceMemberById: FlatWorkspaceMemberMaps['byId'];
  }): Promise<void> {
    const reason = getAgentChatPushNotificationReason({
      thread,
      participant,
      workspaceMemberId: recipient.id,
      inboxNotificationLevel: recipient.inboxNotificationLevel,
    });

    if (!isDefined(reason)) {
      return;
    }

    const hasFocusedTab = await this.webPushService.hasFocusedTab({
      workspaceId,
      userId: recipient.userId,
    });

    if (hasFocusedTab) {
      return;
    }

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

    await this.webPushService.sendNotificationToUser({
      workspaceId,
      userId: recipient.userId,
      notification: {
        ...buildAgentChatPushNotification({
          i18n: this.i18nService.getI18nInstance(recipient.locale),
          thread,
          recipientWorkspaceMemberId: recipient.id,
          workspaceMemberById,
          isPreviewEnabled: recipient.isInboxNotificationPreviewEnabled,
        }),
        renotify:
          reason === 'DIRECT_MESSAGE' ||
          reason === 'MENTION' ||
          isOutsideRenotifyCooldown,
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
    const rows = await this.threadRepository.query(workspaceId, ({ manager }) =>
      manager.query<AgentChatThreadParticipantRow[]>(
        `SELECT "workspaceMemberId", "lastReadAt", "archivedAt", "snoozedUntil", "isSubscribed", "lastMentionedAt", "mentionsResolvedAt"
         FROM ${getAgentChatThreadParticipantTable(workspaceId)}
         WHERE "threadId" = $1`,
        [threadId],
      ),
    );

    return new Map(
      rows.map((row) => [
        row.workspaceMemberId,
        {
          lastReadAt: toIsoStringOrNull(row.lastReadAt),
          archivedAt: toIsoStringOrNull(row.archivedAt),
          snoozedUntil: toIsoStringOrNull(row.snoozedUntil),
          isSubscribed: row.isSubscribed,
          lastMentionedAt: toIsoStringOrNull(row.lastMentionedAt),
          mentionsResolvedAt: toIsoStringOrNull(row.mentionsResolvedAt),
        },
      ]),
    );
  }
}
