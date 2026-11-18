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
import { WebPushPresenceService } from 'src/engine/core-modules/web-push/services/web-push-presence.service';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { AGENT_CHAT_PUSH_NOTIFICATION_COOLDOWN_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-push-notification-cooldown-ms.constant';
import { type SendAgentChatPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications-job.types';
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

type ParticipantInboxRow = Pick<
  AgentChatThreadParticipantRow,
  | 'workspaceMemberId'
  | 'lastReadAt'
  | 'archivedAt'
  | 'snoozedUntil'
  | 'isSubscribed'
  | 'lastMentionedAt'
  | 'mentionsResolvedAt'
>;

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
    private readonly webPushPresenceService: WebPushPresenceService,
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
      !isDefined(workspace) ||
      workspace.activationStatus !== WorkspaceActivationStatus.ACTIVE ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspaceId,
      ))
    ) {
      return;
    }

    const participantRows = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<ParticipantInboxRow[]>(
          `SELECT "workspaceMemberId", "lastReadAt", "archivedAt", "snoozedUntil", "isSubscribed", "lastMentionedAt", "mentionsResolvedAt"
           FROM ${getAgentChatThreadParticipantTable(workspaceId)}
           WHERE "threadId" = $1`,
          [thread.id],
        ),
    );
    const participantByWorkspaceMemberId = new Map<string, AgentChatInboxState>(
      participantRows.map((row) => [
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
    const recipientWorkspaceMemberIds = [
      ...new Set([
        ...participantByWorkspaceMemberId.keys(),
        thread.directMessageFirstWorkspaceMemberId,
        thread.directMessageSecondWorkspaceMemberId,
        thread.assigneeId,
      ]),
    ].filter(
      (workspaceMemberId): workspaceMemberId is string =>
        isDefined(workspaceMemberId) &&
        workspaceMemberId !== thread.lastMessageSenderWorkspaceMemberId,
    );

    if (recipientWorkspaceMemberIds.length === 0) {
      return;
    }

    const workspaceMembers = await this.findWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [
        ...recipientWorkspaceMemberIds,
        thread.lastMessageSenderWorkspaceMemberId,
        thread.directMessageFirstWorkspaceMemberId,
        thread.directMessageSecondWorkspaceMemberId,
      ].filter(isDefined),
    });

    for (const workspaceMember of workspaceMembers) {
      if (!recipientWorkspaceMemberIds.includes(workspaceMember.id)) {
        continue;
      }

      try {
        const reason = getAgentChatPushNotificationReason({
          thread,
          participant: participantByWorkspaceMemberId.get(workspaceMember.id),
          workspaceMemberId: workspaceMember.id,
          inboxNotificationLevel: workspaceMember.inboxNotificationLevel,
        });

        if (
          !isDefined(reason) ||
          (await this.webPushPresenceService.hasFocusedTab({
            workspaceId,
            userId: workspaceMember.userId,
          }))
        ) {
          continue;
        }

        const readableThreadIds =
          await this.sharingService.findReadableThreadIds({
            workspaceId,
            workspaceMemberId: workspaceMember.id,
            threadIds: [thread.id],
          });

        if (!readableThreadIds.includes(thread.id)) {
          continue;
        }

        const isOutsideCooldown = await this.cacheStorageService.setIfAbsent(
          `cooldown:${workspaceMember.id}:${thread.id}`,
          true,
          AGENT_CHAT_PUSH_NOTIFICATION_COOLDOWN_MS,
        );

        await this.webPushService.sendToUser({
          workspace,
          userId: workspaceMember.userId,
          notification: {
            ...buildAgentChatPushNotification({
              i18n: this.i18nService.getI18nInstance(workspaceMember.locale),
              thread,
              recipientWorkspaceMemberId: workspaceMember.id,
              workspaceMembers,
              isPreviewEnabled:
                workspaceMember.isInboxNotificationPreviewEnabled,
            }),
            renotify:
              reason === 'DIRECT_MESSAGE' ||
              reason === 'MENTION' ||
              isOutsideCooldown,
          },
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
