import { Injectable } from '@nestjs/common';

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

  async refreshAllCampaignCounts(workspaceId: string): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const campaigns = await campaignRepository.find({
        select: { id: true },
      });

      for (const campaign of campaigns) {
        await this.refreshCampaignCounts(workspaceId, campaign.id);
      }
    }, buildSystemAuthContext(workspaceId));
  }

  async refreshCampaignCounts(
    workspaceId: string,
    campaignId: string,
  ): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const countMessagesWithDeliveryStatus = (deliveryStatus: string) =>
        messageRepository.count({
          where: { messageCampaignId: campaignId, deliveryStatus },
        });

      const [sentCount, failedCount, bouncedCount, complainedCount] =
        await Promise.all([
          countMessagesWithDeliveryStatus(
            CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
          ),
          countMessagesWithDeliveryStatus(
            CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
          ),
          countMessagesWithDeliveryStatus(
            CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
          ),
          countMessagesWithDeliveryStatus(
            CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
          ),
        ]);

      const campaignRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      await campaignRepository.update(
        { id: campaignId },
        { sentCount, failedCount, bouncedCount, complainedCount },
      );
    }, buildSystemAuthContext(workspaceId));
  }
}
