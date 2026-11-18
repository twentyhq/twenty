import { Injectable, Logger } from '@nestjs/common';

import { type AgentChatInboxState } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
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
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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
    const recipientIds = [
      ...participants.keys(),
      thread.directMessageFirstWorkspaceMemberId,
      thread.directMessageSecondWorkspaceMemberId,
      thread.assigneeId,
    ].filter(
      (workspaceMemberId): workspaceMemberId is string =>
        isDefined(workspaceMemberId) &&
        workspaceMemberId !== thread.lastMessageSenderWorkspaceMemberId,
    );

    if (recipientIds.length === 0) {
      return;
    }

    const workspaceMembers = await this.findWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [
        ...recipientIds,
        thread.lastMessageSenderWorkspaceMemberId,
        thread.directMessageFirstWorkspaceMemberId,
        thread.directMessageSecondWorkspaceMemberId,
      ].filter(isDefined),
    });

    for (const recipient of workspaceMembers) {
      if (!recipientIds.includes(recipient.id)) {
        continue;
      }

      try {
        const reason = getAgentChatPushNotificationReason({
          thread,
          participant: participants.get(recipient.id),
          workspaceMemberId: recipient.id,
          inboxNotificationLevel: recipient.inboxNotificationLevel,
        });

        if (
          !isDefined(reason) ||
          (await this.webPushService.hasFocusedTab({
            workspaceId,
            userId: recipient.userId,
          }))
        ) {
          continue;
        }

        const readableThreadIds =
          await this.sharingService.findReadableThreadIds({
            workspaceId,
            workspaceMemberId: recipient.id,
            threadIds: [thread.id],
          });

        if (!readableThreadIds.includes(thread.id)) {
          continue;
        }

        const isOutsideCooldown = await this.cacheStorageService.setIfAbsent(
          `cooldown:${recipient.id}:${thread.id}`,
          true,
          RENOTIFY_COOLDOWN_MS,
        );

        await this.webPushService.sendToUser({
          workspaceId,
          userId: recipient.userId,
          notification: {
            ...buildAgentChatPushNotification({
              i18n: this.i18nService.getI18nInstance(recipient.locale),
              thread,
              recipientWorkspaceMemberId: recipient.id,
              workspaceMembers,
              isPreviewEnabled: recipient.isInboxNotificationPreviewEnabled,
            }),
            renotify:
              reason === 'DIRECT_MESSAGE' ||
              reason === 'MENTION' ||
              isOutsideCooldown,
          },
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

  private async findWorkspaceMembers({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<WorkspaceMemberWorkspaceEntity[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
          'workspaceMember',
        );

      return workspaceMemberRepository.find({
        where: { id: In([...new Set(workspaceMemberIds)]) },
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
