import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

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

  async countMessagesByDeliveryStatus({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<Map<string, number>> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
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

        return new Map(
          deliveryStatusCountRows.flatMap<[string, number]>((row) =>
            isNonEmptyString(row.deliveryStatus)
              ? [[row.deliveryStatus, Number(row.count)]]
              : [],
          ),
        );
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  async refreshCampaignCounts({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const countByDeliveryStatus = await this.countMessagesByDeliveryStatus({
      workspaceId,
      campaignId,
    });

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const sentCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT) ?? 0;
      const failedCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED) ?? 0;
      const skippedCount =
        countByDeliveryStatus.get(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED) ??
        0;
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
        {
          sentCount,
          failedCount,
          skippedCount,
          bouncedCount,
          complainedCount,
        },
      );
    }, buildSystemAuthContext(workspaceId));
  }
}
