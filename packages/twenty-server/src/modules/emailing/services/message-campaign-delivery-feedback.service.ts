import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { listDeliveryStatusesOverridableBy } from 'src/modules/emailing/utils/list-delivery-statuses-overridable-by.util';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MessageCampaignDeliveryFeedbackService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
  ) {}

  async recordDeliveryStatusByProviderMessageId({
    workspaceId,
    providerMessageId,
    deliveryStatus,
  }: {
    workspaceId: string;
    providerMessageId: string;
    deliveryStatus: CampaignMessageDeliveryStatus;
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

      const overridableDeliveryStatuses =
        listDeliveryStatusesOverridableBy(deliveryStatus);

      const { affected } = await messageRepository.update(
        { id: message.id, deliveryStatus: In(overridableDeliveryStatuses) },
        { deliveryStatus },
      );

      if (affected !== 1) {
        return;
      }

      await this.messageCampaignLifecycleService.scheduleStatsRefresh({
        workspaceId,
        campaignId: message.messageCampaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
