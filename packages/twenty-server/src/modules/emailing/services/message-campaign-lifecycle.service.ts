import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';
import { CAMPAIGN_MESSAGE_CLAIM_STALE_THRESHOLD_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-message-claim-stale-threshold-ms.constant';
import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { In, LessThan } from 'typeorm';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  CAMPAIGN_STATS_REFRESH_DELAY_MS,
  REFRESH_CAMPAIGN_STATS_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type RefreshCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/refresh-campaign-stats-job-data.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { computeCampaignTerminalStatus } from 'src/modules/emailing/utils/compute-campaign-terminal-status.util';
import { readCampaignMessageCounts } from 'src/modules/emailing/utils/read-campaign-message-counts.util';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type CampaignStatusTransition = {
  workspaceId: string;
  campaignId: string;
  from: MessageCampaignStatus;
  to: MessageCampaignStatus;
  roleId?: string;
};

@Injectable()
export class MessageCampaignLifecycleService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleEmailing)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async transitionCampaignStatus({
    workspaceId,
    campaignId,
    from,
    to,
    roleId,
  }: CampaignStatusTransition): Promise<boolean> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageCampaignWorkspaceEntity,
            isDefined(roleId)
              ? { unionOf: [roleId] }
              : { shouldBypassPermissionChecks: true },
          );

        const { affected } = await campaignRepository.update(
          { id: campaignId, status: from },
          { status: to },
        );

        return affected === 1;
      },
      isDefined(roleId) ? undefined : buildSystemAuthContext(workspaceId),
    );
  }

  async cancelCampaignOrThrow({
    workspaceId,
    userWorkspaceId,
    campaignId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
  }): Promise<{ campaignId: string; canceledMessageCount: number }> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const canceled = await this.transitionCampaignStatus({
      workspaceId,
      campaignId,
      roleId,
      from: MessageCampaignStatus.SENDING,
      to: MessageCampaignStatus.CANCELED,
    });

    if (!canceled) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is not sending`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_CANCELABLE,
      );
    }

    const canceledMessageCount = await this.settleMessages({
      workspaceId,
      campaignId,
      fromStatuses: [CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED],
      toStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
    });

    await this.scheduleStatsRefresh({ workspaceId, campaignId });

    return { campaignId, canceledMessageCount };
  }

  async failStalledMessages({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<number> {
    const staleSince = new Date(
      Date.now() - CAMPAIGN_MESSAGE_CLAIM_STALE_THRESHOLD_MS,
    ).toISOString();

    const failedQueuedCount = await this.settleMessages({
      workspaceId,
      campaignId,
      fromStatuses: [CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED],
      toStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      unchangedSince: staleSince,
    });

    const failedAbandonedClaimCount = await this.settleMessages({
      workspaceId,
      campaignId,
      fromStatuses: [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING],
      toStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      unchangedSince: staleSince,
    });

    return failedQueuedCount + failedAbandonedClaimCount;
  }

  private async settleMessages({
    workspaceId,
    campaignId,
    fromStatuses,
    toStatus,
    unchangedSince,
  }: {
    workspaceId: string;
    campaignId: string;
    fromStatuses: CampaignMessageDeliveryStatus[];
    toStatus: CampaignMessageDeliveryStatus;
    unchangedSince?: string;
  }): Promise<number> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const settleableCriteria = {
          messageCampaignId: campaignId,
          deliveryStatus: In(fromStatuses),
          ...(isDefined(unchangedSince)
            ? { updatedAt: LessThan(unchangedSince) }
            : {}),
        };

        const settleableMessages = await messageRepository.find({
          where: settleableCriteria,
          select: { id: true },
        });

        let settledCount = 0;

        for (const idsChunk of chunk(
          settleableMessages.map((message) => message.id),
          QUERY_MAX_RECORDS,
        )) {
          const { affected } = await messageRepository.update(
            { ...settleableCriteria, id: In(idsChunk) },
            { deliveryStatus: toStatus },
          );

          settledCount += affected ?? 0;
        }

        return settledCount;
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  async finalizeCampaignIfComplete({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const countByDeliveryStatus =
      await this.messageCampaignStatisticsService.countMessagesByDeliveryStatus(
        { workspaceId, campaignId },
      );

    const terminalStatus = computeCampaignTerminalStatus(
      readCampaignMessageCounts(countByDeliveryStatus),
    );

    if (!isDefined(terminalStatus)) {
      return;
    }

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const correctableStatuses =
      terminalStatus === MessageCampaignStatus.SENT
        ? [
            MessageCampaignStatus.SENDING,
            MessageCampaignStatus.SENT_WITH_ERRORS,
          ]
        : [MessageCampaignStatus.SENDING];

    await campaignRepository.update(
      { id: campaignId, status: In(correctableStatuses) },
      { status: terminalStatus, sentAt: new Date() },
    );

    await this.scheduleStatsRefresh({ workspaceId, campaignId });
  }

  async scheduleStatsRefresh({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const acquired = await this.cacheStorageService.acquireLock(
      `campaign-stats-refresh:${workspaceId}:${campaignId}`,
      CAMPAIGN_STATS_REFRESH_DELAY_MS,
    );

    if (!acquired) {
      return;
    }

    await this.messageQueueService.add<RefreshCampaignStatsJobData>(
      REFRESH_CAMPAIGN_STATS_JOB,
      { workspaceId, campaignId },
      { delay: CAMPAIGN_STATS_REFRESH_DELAY_MS },
    );
  }
}
