import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

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
