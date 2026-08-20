import { Injectable } from '@nestjs/common';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MessageCampaignDeliveryFeedbackService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
  ) {}

  async recordDeliveryFailureByProviderMessageId({
    workspaceId,
    providerMessageId,
    deliveryStatus,
  }: {
    workspaceId: string;
    providerMessageId: string;
    deliveryStatus: string;
  }): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const message = await messageRepository.findOne({
        where: { headerMessageId: providerMessageId },
      });

      if (!isDefined(message) || !isDefined(message.messageCampaignId)) {
        return;
      }

      const isAlreadyTerminal =
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED ||
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED;

      if (isAlreadyTerminal) {
        return;
      }

      await messageRepository.update(message.id, { deliveryStatus });

      await this.messageCampaignLifecycleService.scheduleStatsRefresh({
        workspaceId,
        campaignId: message.messageCampaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
