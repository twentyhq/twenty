import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type CampaignCountGroup } from 'src/engine/core-modules/emailing-domain/types/campaign-count-group.type';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

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
      .where('delivery."workspaceId" = :workspaceId', { workspaceId })
      .andWhere('delivery."campaignId" = :campaignId', { campaignId })
      .groupBy('delivery.state')
      .getRawMany<CampaignCountGroup>();

    return computeCampaignCounts({ groups });
  }

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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
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
