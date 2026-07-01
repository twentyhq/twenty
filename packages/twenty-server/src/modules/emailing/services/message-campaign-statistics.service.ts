import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private getSystemRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks: true,
    });
  }

  // Backfills counters for campaigns that predate the stat fields.
  async refreshAllCampaignCounts(workspaceId: string): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = await this.getSystemRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
      );

      const campaigns = await campaignRepository.find({
        select: { id: true },
      });

      for (const campaign of campaigns) {
        await this.refreshCampaignCounts(workspaceId, campaign.id);
      }
    }, buildSystemAuthContext(workspaceId));
  }

  // Recomputed at finalization and on each status change, since bounces and
  // complaints arrive asynchronously via SES webhooks.
  async refreshCampaignCounts(
    workspaceId: string,
    campaignId: string,
  ): Promise<void> {
    const messageRepository = await this.getSystemRepository(
      workspaceId,
      MessageWorkspaceEntity,
    );

    const countByStatus = (deliveryStatus: string) =>
      messageRepository.count({
        where: { messageCampaignId: campaignId, deliveryStatus },
      });

    const [sentCount, failedCount, bouncedCount, complainedCount] =
      await Promise.all([
        countByStatus(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT),
        countByStatus(CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED),
        countByStatus(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED),
        countByStatus(CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED),
      ]);

    const campaignRepository = await this.getSystemRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
    );

    await campaignRepository.update(
      { id: campaignId },
      { sentCount, failedCount, bouncedCount, complainedCount },
    );
  }
}
