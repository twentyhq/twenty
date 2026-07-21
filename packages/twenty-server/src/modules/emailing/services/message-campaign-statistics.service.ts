import { Injectable } from '@nestjs/common';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

type DeliveryStatusCountRow = {
  deliveryStatus: string | null;
  count: string;
};

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async refreshCampaignCounts({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const deliveryStatusCountRows = await messageRepository
        .createQueryBuilder('message')
        .select('message.deliveryStatus', 'deliveryStatus')
        .addSelect('COUNT(*)', 'count')
        .where('message.messageCampaignId = :campaignId', { campaignId })
        .groupBy('message.deliveryStatus')
        .getRawMany<DeliveryStatusCountRow>();

      const countByDeliveryStatus = new Map(
        deliveryStatusCountRows.map((row) => [
          row.deliveryStatus,
          Number(row.count),
        ]),
      );

      const sentCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT) ?? 0;
      const failedCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED) ?? 0;
      const bouncedCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED) ??
        0;
      const complainedCount =
        countByDeliveryStatus.get(
          CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
        ) ?? 0;

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
