import { Injectable } from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/types/campaign-skip-reason.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

import { type FindOptionsWhere, In, LessThan } from 'typeorm';

import {
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
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    @InjectMessageQueue(MessageQueue.emailQueue)
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

    const canceledMessageCount = await this.settleDeliveries({
      workspaceId,
      criteria: {
        campaignId,
        state: CAMPAIGN_DELIVERY_STATE.QUEUED,
      },
      update: {
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
      },
    });

    await this.scheduleStatsRefresh({ workspaceId, campaignId });

    return { campaignId, canceledMessageCount };
  }

  // Only expired claims are reclaimed. A QUEUED delivery is not stalled, it is
  // waiting on the queue, and failing it here is what previously let a second
  // worker re-claim a send the first was still making.
  async failStalledMessages({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<number> {
    return this.settleDeliveries({
      workspaceId,
      criteria: {
        campaignId,
        state: CAMPAIGN_DELIVERY_STATE.SENDING,
        claimExpiresAt: LessThan(new Date()),
      },
      update: {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        failureReason: CAMPAIGN_FAILURE_REASON.CLAIM_EXPIRED,
        claimToken: null,
        claimExpiresAt: null,
      },
    });
  }

  private async settleDeliveries({
    workspaceId,
    criteria,
    update,
  }: {
    workspaceId: string;
    criteria: FindOptionsWhere<CampaignDeliveryEntity>;
    update: QueryDeepPartialEntity<CampaignDeliveryEntity>;
  }): Promise<number> {
    const { affected } = await this.campaignDeliveryRepository.update(
      workspaceId,
      criteria,
      update,
    );

    return affected ?? 0;
  }

  async finalizeCampaignIfComplete({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const counts =
      await this.messageCampaignStatisticsService.countDeliveriesByState({
        workspaceId,
        campaignId,
      });

    const terminalStatus = computeCampaignTerminalStatus(counts);

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
