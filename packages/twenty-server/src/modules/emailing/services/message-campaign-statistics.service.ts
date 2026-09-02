import { CAMPAIGN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-job-retry-limit.constant';
import { Injectable } from '@nestjs/common';

import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

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
import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type CampaignCountGroup } from 'src/engine/core-modules/emailing-domain/types/campaign-count-group.type';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

const RECONCILIATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_LOCK_TTL_MS = CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS + 2_000;

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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
    const lockKey = `campaign-stats-refresh:${workspaceId}:${campaignId}`;

    const acquired = await this.cacheStorageService.acquireLock(
      lockKey,
      REFRESH_LOCK_TTL_MS,
    );

    if (!acquired) {
      return;
    }

    await this.messageQueueService
      .add<RefreshCampaignStatsJobData>(
        REFRESH_CAMPAIGN_STATS_JOB,
        { workspaceId, campaignId },
        {
          delay: CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS,
          retryLimit: CAMPAIGN_JOB_RETRY_LIMIT,
        },
      )
      .catch(async (error) => {
        await this.cacheStorageService.releaseLock(lockKey);

        throw error;
      });
  }

  async countDeliveriesByState({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<CampaignCounts> {
    const groups = await this.campaignDeliveryRepository
      .createQueryBuilder('delivery')
      .select('delivery.state', 'state')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COUNT(delivery."deliveredAt")', 'deliveredCount')
      .addSelect('COUNT(delivery."bouncedAt")', 'bouncedCount')
      .addSelect('COUNT(delivery."complainedAt")', 'complainedCount')
      .addSelect(
        `COUNT(*) FILTER (WHERE delivery."rejectedAt" IS NOT NULL OR delivery."renderingFailedAt" IS NOT NULL)`,
        'providerFailedCount',
      )
      .where('delivery."workspaceId" = :workspaceId', { workspaceId })
      .andWhere('delivery."campaignId" = :campaignId', { campaignId })
      .groupBy('delivery.state')
      .getRawMany<CampaignCountGroup>();

    return computeCampaignCounts({ groups });
  }

  // The refresh lock is left to expire instead of being released here: a
  // backed-up queue can start this job after the lock TTL, and deleting the key
  // then would drop the lock a newer schedule already owns.
  async refreshCampaignCounts({
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

    await this.persistCampaignCounts({ workspaceId, campaignId, counts });
  }

  async reconcileWorkspaceCampaignCounts({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const campaignIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

        const campaigns = await campaignRepository.find({
          where: [
            { status: MessageCampaignStatus.SENDING },
            {
              sentAt: MoreThanOrEqual(
                new Date(Date.now() - RECONCILIATION_WINDOW_MS),
              ),
            },
          ],
          select: { id: true },
        });

        return campaigns.map((campaign) => campaign.id);
      }, buildSystemAuthContext(workspaceId));

    for (const campaignId of campaignIds) {
      await this.refreshCampaignCounts({ workspaceId, campaignId });
    }
  }

  async persistCampaignCounts({
    workspaceId,
    campaignId,
    counts,
  }: {
    workspaceId: string;
    campaignId: string;
    counts: CampaignCounts;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
        select: {
          id: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          skippedCount: true,
          bouncedCount: true,
          complainedCount: true,
        },
      });

      if (!isDefined(campaign)) {
        return;
      }

      const nextCounts = {
        sentCount: counts.sentCount,
        deliveredCount: counts.deliveredCount,
        failedCount: counts.failedCount,
        skippedCount: counts.skippedCount,
        bouncedCount: counts.bouncedCount,
        complainedCount: counts.complainedCount,
      };

      const storedCounts = {
        sentCount: campaign.sentCount,
        deliveredCount: campaign.deliveredCount,
        failedCount: campaign.failedCount,
        skippedCount: campaign.skippedCount,
        bouncedCount: campaign.bouncedCount,
        complainedCount: campaign.complainedCount,
      };

      if (fastDeepEqual(storedCounts, nextCounts)) {
        return;
      }

      await campaignRepository.update({ id: campaignId }, nextCounts);
    }, buildSystemAuthContext(workspaceId));
  }
}
