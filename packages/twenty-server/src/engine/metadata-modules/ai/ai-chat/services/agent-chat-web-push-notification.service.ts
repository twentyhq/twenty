import { Injectable, Logger } from '@nestjs/common';

import {
  type AgentChatInboxState,
  isAgentChatMentionUnresolved,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TabPresenceService } from 'src/engine/core-modules/tab-presence/services/tab-presence.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type SendAgentChatWebPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-web-push-notifications-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { buildAgentChatWebPushNotification } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-web-push-notification.util';
import { getAgentChatWebPushNotificationReason } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-web-push-notification-reason.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { InboxObjectNamesResolverService } from 'src/engine/metadata-modules/ai/ai-history/services/inbox-object-names-resolver.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

const RENOTIFY_COOLDOWN_MS = 15_000;
const ALERTED_MENTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AgentChatWebPushNotificationService {
  private readonly logger = new Logger(
    AgentChatWebPushNotificationService.name,
  );

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly i18nService: I18nService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly sharingService: AgentChatSharingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly webPushService: WebPushService,
    private readonly tabPresenceService: TabPresenceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly inboxObjectNamesResolverService: InboxObjectNamesResolverService,
  ) {}

  async sendWebPushNotifications({
    workspaceId,
    threadId,
    lastActivityAt,
  }: SendAgentChatWebPushNotificationsJobData): Promise<void> {
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
    const workspaceMemberIdsWithUnalertedMention =
      await this.claimUnalertedMentions({
        workspaceId,
        threadId: thread.id,
        participants,
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
      await this.tabPresenceService.findWorkspaceMemberIdsWithFocusedTab({
        workspaceId,
        workspaceMemberIds: candidateWorkspaceMemberIds,
      });
    const unfocusedWorkspaceMemberIds = candidateWorkspaceMemberIds.filter(
      (workspaceMemberId) => !focusedWorkspaceMemberIds.has(workspaceMemberId),
    );

    if (unfocusedWorkspaceMemberIds.length === 0) {
      return;
    }

    const workspaceMemberById = await this.findWorkspaceMembersById({
      workspaceId,
      workspaceMemberIds: [
        ...unfocusedWorkspaceMemberIds,
        thread.lastMessageSenderWorkspaceMemberId,
        thread.directMessageFirstWorkspaceMemberId,
        thread.directMessageSecondWorkspaceMemberId,
      ].filter(isDefined),
    });
    const inboxNotificationSettingsByUserId =
      await this.userWorkspaceService.findInboxNotificationSettingsByUserId({
        workspaceId,
        userIds: unfocusedWorkspaceMemberIds
          .map(
            (workspaceMemberId) =>
              workspaceMemberById[workspaceMemberId]?.userId,
          )
          .filter(isDefined),
      });
    const recipients = unfocusedWorkspaceMemberIds.flatMap(
      (workspaceMemberId) => {
        const workspaceMember = workspaceMemberById[workspaceMemberId];
        const inboxNotificationSettings = isDefined(workspaceMember)
          ? inboxNotificationSettingsByUserId[workspaceMember.userId]
          : undefined;

        if (
          !isDefined(workspaceMember) ||
          !isDefined(inboxNotificationSettings)
        ) {
          return [];
        }

        const reason = getAgentChatWebPushNotificationReason({
          thread,
          participant: participants.get(workspaceMemberId),
          workspaceMemberId,
          inboxNotificationLevel:
            inboxNotificationSettings.inboxNotificationLevel,
          hasUnalertedMention:
            workspaceMemberIdsWithUnalertedMention.has(workspaceMemberId),
        });

        return isDefined(reason)
          ? [
              {
                workspaceMember,
                reason,
                isPreviewEnabled:
                  inboxNotificationSettings.isInboxNotificationPreviewEnabled,
              },
            ]
          : [];
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

    for (const { workspaceMember, reason, isPreviewEnabled } of recipients) {
      const webPushSubscriptions =
        webPushSubscriptionsByUserId[workspaceMember.userId];

      if (!isNonEmptyArray(webPushSubscriptions)) {
        continue;
      }

      try {
        await this.sendWebPushNotificationToRecipient({
          workspaceId,
          thread,
          recipient: workspaceMember,
          isPreviewEnabled,
          isRenotifyForced: reason === 'DIRECT_MESSAGE' || reason === 'MENTION',
          webPushSubscriptions,
          workspaceMemberById,
          assistantDisplayName: workspace.aiChatAssistantProfile.displayName,
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

  private async sendWebPushNotificationToRecipient({
    workspaceId,
    thread,
    recipient,
    isPreviewEnabled,
    isRenotifyForced,
    webPushSubscriptions,
    workspaceMemberById,
    assistantDisplayName,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    recipient: Pick<WorkspaceMemberWorkspaceEntity, 'id' | 'userId' | 'locale'>;
    isPreviewEnabled: boolean;
    isRenotifyForced: boolean;
    webPushSubscriptions: WebPushSubscriptionEntity[];
    workspaceMemberById: Partial<
      Record<string, WorkspaceMemberWorkspaceEntity>
    >;
    assistantDisplayName: string;
  }): Promise<void> {
    const [readableThreadId] = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId: recipient.id,
      threadIds: [thread.id],
    });

    if (!isDefined(readableThreadId)) {
      return;
    }

    const { unreadOpenThreadCount } =
      await this.participantService.findOpenThreadsSummary({
        workspaceId,
        workspaceMemberId: recipient.id,
      });
    const isOutsideRenotifyCooldown =
      await this.cacheStorageService.setIfAbsent(
        `agent-chat-renotify-cooldown:${workspaceId}:${thread.id}:${recipient.id}`,
        true,
        RENOTIFY_COOLDOWN_MS,
      );

    await this.webPushService.sendNotification({
      workspaceId,
      userId: recipient.userId,
      webPushSubscriptions,
      notification: {
        ...buildAgentChatWebPushNotification({
          i18n: this.i18nService.getI18nInstance(recipient.locale),
          thread,
          recipientWorkspaceMemberId: recipient.id,
          workspaceMemberById,
          isPreviewEnabled,
          assistantDisplayName,
        }),
        renotify: isRenotifyForced || isOutsideRenotifyCooldown,
        badgeCount: unreadOpenThreadCount,
      },
    });
  }

  private async claimUnalertedMentions({
    workspaceId,
    threadId,
    participants,
  }: {
    workspaceId: string;
    threadId: string;
    participants: Map<string, AgentChatInboxState>;
  }): Promise<Set<string>> {
    const claimedWorkspaceMemberIds = await Promise.all(
      [...participants].map(async ([workspaceMemberId, participant]) => {
        if (!isAgentChatMentionUnresolved(participant)) {
          return null;
        }

        const isFirstClaim = await this.cacheStorageService.setIfAbsent(
          `agent-chat-alerted-mention:${workspaceId}:${threadId}:${workspaceMemberId}:${participant.lastMentionedAt}`,
          true,
          ALERTED_MENTION_TTL_MS,
        );

        return isFirstClaim ? workspaceMemberId : null;
      }),
    );

    return new Set(claimedWorkspaceMemberIds.filter(isDefined));
  }

  private async findParticipants({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<Map<string, AgentChatInboxState>> {
    const { agentChatThreadParticipant: participantObjectName } =
      await this.inboxObjectNamesResolverService.resolve(workspaceId);

    const participants =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
              participantObjectName,
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

  private async findWorkspaceMembersById({
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
