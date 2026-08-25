import { CAMPAIGN_STATS_RECONCILIATION_WINDOW_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-stats-reconciliation-window-ms.constant';
import { CAMPAIGN_STATS_REFRESH_LOCK_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-stats-refresh-lock-ttl-ms.constant';
import { CAMPAIGN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-job-retry-limit.constant';
import { Injectable } from '@nestjs/common';

import { MoreThanOrEqual } from 'typeorm';
import { MessageCampaignStatus } from 'twenty-shared/types';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS,
  REFRESH_CAMPAIGN_STATS_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type RefreshCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/refresh-campaign-stats-job-data.type';
import { buildCampaignStatsRefreshLockKey } from 'src/engine/core-modules/emailing-domain/utils/build-campaign-stats-refresh-lock-key.util';
import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleEmailing)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async scheduleRefresh({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const lockKey = buildCampaignStatsRefreshLockKey({
      workspaceId,
      campaignId,
    });

    const acquired = await this.cacheStorageService.acquireLock(
      lockKey,
      CAMPAIGN_STATS_REFRESH_LOCK_TTL_MS,
    );

    if (!acquired) {
      return;
    }

    await this.messageQueueService.add<RefreshCampaignStatsJobData>(
      REFRESH_CAMPAIGN_STATS_JOB,
      { workspaceId, campaignId },
      {
        delay: CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS,
        retryLimit: CAMPAIGN_JOB_RETRY_LIMIT,
      },
    );
  }

  async countDeliveriesByState({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<CampaignCounts> {
    const deliveries = await this.campaignDeliveryRepository.find(workspaceId, {
      where: { campaignId },
      select: {
        id: true,
        state: true,
        deliveredAt: true,
        bouncedAt: true,
        complainedAt: true,
      },
    });

    return computeCampaignCounts({ deliveries });
  }

  async refreshCampaignCounts({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    try {
      await this.recomputeCampaignCounts({ workspaceId, campaignId });
    } finally {
      await this.cacheStorageService.releaseLock(
        buildCampaignStatsRefreshLockKey({ workspaceId, campaignId }),
      );
    }
  }

  async reconcileWorkspaceCampaignCounts({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const campaignIds =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const campaignRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              MessageCampaignWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          const campaigns = await campaignRepository.find({
            where: [
              { status: MessageCampaignStatus.SENDING },
              {
                sentAt: MoreThanOrEqual(
                  new Date(
                    Date.now() - CAMPAIGN_STATS_RECONCILIATION_WINDOW_MS,
                  ),
                ),
              },
            ],
            select: { id: true },
          });

          return campaigns.map((campaign) => campaign.id);
        },
        buildSystemAuthContext(workspaceId),
      );

    for (const campaignId of campaignIds) {
      await this.recomputeCampaignCounts({ workspaceId, campaignId });
    }
  }

  private async recomputeCampaignCounts({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const counts = await this.countDeliveriesByState({
      workspaceId,
      campaignId,
    });

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      await campaignRepository.update(
        { id: campaignId },
        {
          sentCount: counts.sentCount,
          deliveredCount: counts.deliveredCount,
          failedCount: counts.failedCount,
          skippedCount: counts.skippedCount,
          bouncedCount: counts.bouncedCount,
          complainedCount: counts.complainedCount,
        },
      );
    }, buildSystemAuthContext(workspaceId));
  }
}
