import { Injectable } from '@nestjs/common';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
import { buildCampaignDeliveryOutcomeUpdate } from 'src/engine/core-modules/emailing-domain/utils/build-campaign-delivery-outcome-update.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MessageCampaignDeliveryFeedbackService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async recordProviderOutcomeByProviderMessageId({
    workspaceId,
    providerMessageId,
    outcome,
  }: {
    workspaceId: string;
    providerMessageId: string;
    outcome: CampaignProviderOutcome;
  }): Promise<void> {
    const update = buildCampaignDeliveryOutcomeUpdate({
      outcome,
      occurredAt: new Date(),
    });

    if (Object.keys(update).length === 0) {
      return;
    }

    // Matched and stamped in one statement rather than a lookup followed by an
    // update: providerMessageId is unique per workspace, so this settles the
    // same single row, halves the queries a webhook costs, and closes the
    // window where the row could change between the two.
    const {
      generatedMaps: [updatedDelivery],
    } = await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignDeliveryRepository = this.workspaceOrmManager.getRepository(
        CampaignDeliveryWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );
      return campaignDeliveryRepository
        .createQueryBuilder()
        .where({ providerMessageId })
        .update()
        .set(update)
        .returning(['campaignId'])
        .execute();
    }, buildSystemAuthContext(workspaceId));

    if (!isDefined(updatedDelivery)) {
      return;
    }

    await this.messageCampaignStatisticsService.scheduleRefresh({
      workspaceId,
      campaignId: updatedDelivery.campaignId,
    });
  }
}
